use alloy_primitives::{hex, Address};
use alloy_pubsub::SubscriptionStream;
use alloy_rpc_types_eth::{Header, Log};
use alloy_sol_types::SolEvent;
use bigdecimal::BigDecimal;
use chrono::DateTime;
use std::{collections::HashMap, num::NonZero};

use pump::{
    client::{
        block::Block,
        pool::{int_to_decimal, Pool},
        PumpClient, PumpWsClient,
    },
    contract::{pair::UniswapV2Pair, pump::PumpRand},
    db::{
        models::{self, Trade},
        pool::{connect, PgConn, PgPool},
        store,
    },
    error::PumpError,
};

const CONFIRMATIONS: u64 = 1;

pub fn fmt_hex<T: AsRef<[u8]>>(value: T) -> String {
    let bytes = value.as_ref();
    let hex = hex::encode(bytes);
    if hex.len() <= 6 {
        // If there aren't enough characters to shorten, show full hex.
        format!("0x{}", hex)
    } else {
        let prefix = &hex[0..4];
        let suffix = &hex[hex.len() - 4..];
        format!("0x{}...{}", prefix, suffix)
    }
}

fn fmt_px(px: BigDecimal) -> String {
    px.with_precision_round(NonZero::new(10).unwrap(), bigdecimal::RoundingMode::Down)
        .to_engineering_notation()
}

enum BlockKind {
    Block(Block),
    NumberOnly(u64),
}

impl BlockKind {
    fn number(&self) -> u64 {
        match self {
            BlockKind::Block(block) => block.number,
            BlockKind::NumberOnly(number) => *number,
        }
    }
}

#[derive(Default)]
struct PendingLogs {
    wei_in_updates: Vec<Log<PumpRand::WeiInUpdated>>,
    deployed_to_dexs: Vec<Log<PumpRand::DeployedToDex>>,
    swaps: Vec<Log<UniswapV2Pair::Swap>>,
    syncs: Vec<Log<UniswapV2Pair::Sync>>,
}

pub struct LogHandler {
    pool: PgPool,
    client: PumpClient,
    ws: PumpWsClient,
    prices: HashMap<u64, (Block, HashMap<Address, Vec<BigDecimal>>)>,
    opening_prices: HashMap<(u64, Address), BigDecimal>,
    pools: HashMap<Address, Pool>,
    block_timestamps: HashMap<u64, i64>,
    pending_logs: HashMap<u64, PendingLogs>,
}

impl LogHandler {
    pub async fn new(pool: PgPool, client: PumpClient) -> Result<LogHandler, PumpError> {
        let ws = PumpWsClient::new(client.chain_id).await?;
        let mut conn = connect(&pool)?;
        Ok(LogHandler {
            pool,
            client,
            ws,
            prices: HashMap::new(),
            opening_prices: HashMap::new(),
            pools: store::load_pools(&mut conn)?,
            block_timestamps: HashMap::new(),
            pending_logs: HashMap::new(),
        })
    }

    /// returns true if we should restart the stream (for a new LP token)
    pub async fn handle_log(&mut self, log: Log) -> Result<bool, PumpError> {
        match log.topic0() {
            Some(&PumpRand::CoinCreated::SIGNATURE_HASH) => {
                self.handle_creation(log.log_decode::<PumpRand::CoinCreated>()?).await
            }
            Some(&PumpRand::WeiInUpdated::SIGNATURE_HASH) => {
                self.handle_wei_in_updated(log.log_decode::<PumpRand::WeiInUpdated>()?).await
            }
            Some(&PumpRand::CoinGraduated::SIGNATURE_HASH) => {
                self.handle_graduation(log.log_decode::<PumpRand::CoinGraduated>()?).await
            }
            Some(&PumpRand::DeployedToDex::SIGNATURE_HASH) => {
                self.handle_deploy(log.log_decode::<PumpRand::DeployedToDex>()?).await
            }
            Some(&UniswapV2Pair::Swap::SIGNATURE_HASH) => {
                self.handle_swap(log.log_decode::<UniswapV2Pair::Swap>()?).await
            }
            Some(&UniswapV2Pair::Sync::SIGNATURE_HASH) => {
                self.handle_sync(log.log_decode::<UniswapV2Pair::Sync>()?).await
            }
            topic => Err(PumpError::unknown_topic(topic.cloned())),
        }
    }

    async fn handle_creation(&self, log: Log<PumpRand::CoinCreated>) -> Result<bool, PumpError> {
        let mut conn = self.conn()?;
        let coin_id = log.data().coinId;
        let coin = self.client.get_coin(coin_id).await?;
        log::info!(
            "Coin[{}] created at {} by {}",
            coin_id,
            fmt_hex(coin.contractAddress),
            fmt_hex(coin.creator)
        );
        store::upsert_verified(&mut conn, coin_id as i64, coin)?;
        Ok(false)
    }

    async fn handle_wei_in_updated(
        &mut self,
        log: Log<PumpRand::WeiInUpdated>,
    ) -> Result<bool, PumpError> {
        let block = match self.try_block(&log)? {
            BlockKind::Block(block) => block,
            BlockKind::NumberOnly(number) => {
                self.pending_logs
                    .entry(number)
                    .or_insert_with(PendingLogs::default)
                    .wei_in_updates
                    .push(log);
                return Ok(false);
            }
        };
        let data = log.data();
        log::info!(
            "Coin[{}] purchased in block {}. Total purchased: {}",
            data.coinId,
            block.number,
            data.totalWeiIn
        );
        let wei_in = int_to_decimal(data.totalWeiIn);
        let mut conn = self.conn()?;
        store::update_wei_in(&mut conn, data.coinId as i64, wei_in)?;
        Ok(false)
    }

    async fn handle_graduation(
        &self,
        log: Log<PumpRand::CoinGraduated>,
    ) -> Result<bool, PumpError> {
        let block_number = self.try_block(&log)?.number();
        let coin_id = log.data().coinId;
        let mut conn = self.conn()?;
        log::info!("Coin[{}] graduated in block {}", coin_id, block_number);
        store::graduate_coin(&mut conn, coin_id as i64)?;
        let tx = self.client.deploy_graduated(coin_id).await?;
        log::info!("Called graduate({}), tx={}", coin_id, fmt_hex(tx));
        Ok(false)
    }

    async fn handle_deploy(
        &mut self,
        log: Log<PumpRand::DeployedToDex>,
    ) -> Result<bool, PumpError> {
        let block = match self.try_block(&log)? {
            BlockKind::Block(block) => block,
            BlockKind::NumberOnly(number) => {
                self.pending_logs
                    .entry(number)
                    .or_insert_with(PendingLogs::default)
                    .deployed_to_dexs
                    .push(log);
                return Ok(false);
            }
        };
        let data = log.data();
        let mut conn = self.conn()?;
        let pool = self.get_pool(data.lpToken).await?;
        log::info!(
            "Coin[{}] was to deployed to dex with LP address {}",
            data.coinId,
            fmt_hex(data.lpToken)
        );
        self.pools.insert(pool.lp_token, pool);
        let created_at = DateTime::from_timestamp(block.timestamp, 0)
            .expect(&format!("Invalid block timestamp: {}", block.timestamp))
            .naive_utc();
        let pool = models::Pool {
            address: pool.lp_token.to_string(),
            chain_id: self.client.chain_id as i32,
            dex: self.client.router().to_string(),
            token_0: pool.token_0.to_string(),
            token_1: pool.token_1.to_string(),
            created_at,
        };
        store::upsert_deployed_pool(&mut conn, pool)?;
        store::update_deployed_pool(&mut conn, data.coinId as i64, data.lpToken)?;
        Ok(true)
    }

    fn try_block<T>(&self, log: &Log<T>) -> Result<BlockKind, PumpError> {
        match log.block_number {
            Some(number) => {
                let timestamp = self.block_timestamps.get(&number);
                match timestamp {
                    Some(timestamp) => {
                        Ok(BlockKind::Block(Block { number, timestamp: *timestamp as i64 }))
                    }
                    None => Ok(BlockKind::NumberOnly(number)),
                }
            }
            _ => Err(PumpError::no_block_number()),
        }
    }

    async fn get_pool(&mut self, lp_token: Address) -> Result<Pool, PumpError> {
        match self.pools.get(&lp_token) {
            Some(&pair) => Ok(pair),
            None => {
                let pool = self.client.get_pool(lp_token).await?;
                self.pools.insert(lp_token, pool);
                Ok(pool)
            }
        }
    }

    fn insert_price(
        &mut self,
        pool: &Pool,
        dex_price: BigDecimal,
        block: Block,
    ) -> Result<BigDecimal, PumpError> {
        let price = pool.to_ui_price(self.client.weth(), dex_price);
        self.prices
            .entry(block.number)
            .or_insert((block, HashMap::new()))
            .1
            .entry(pool.lp_token)
            .or_insert(vec![])
            .push(price.clone());
        Ok(price)
    }

    async fn handle_swap(&mut self, log: Log<UniswapV2Pair::Swap>) -> Result<bool, PumpError> {
        let block = match self.try_block(&log)? {
            BlockKind::Block(block) => block,
            BlockKind::NumberOnly(number) => {
                self.pending_logs
                    .entry(number)
                    .or_insert_with(PendingLogs::default)
                    .swaps
                    .push(log);
                return Ok(false);
            }
        };

        let lp_token = log.address();
        let pool = self.get_pool(lp_token).await?;
        let data = log.data();
        let (buy_0, amount_0, amount_1, dex_price) = match Pool::swap_price(data) {
            Some(px) => px,
            None => return Err(PumpError::no_swap_price(lp_token, log.transaction_hash)),
        };
        let ui_price = pool.to_ui_price(self.client.weth(), dex_price);
        let (token, weth_0) = pool.other(self.client.weth());
        let (bs, fa) = match buy_0 != weth_0 {
            true => ("BUYS", "FOR"),
            false => ("SELLS", "AT"),
        };
        let fmt_px = fmt_px(ui_price);
        log::info!(
            "Trader {} {} {} {} {} in block {}",
            fmt_hex(data.to),
            bs,
            fmt_hex(token),
            fa,
            fmt_px,
            block.number
        );

        let tx = match log.transaction_hash {
            Some(tx) => tx.to_string(),
            None => return Err(PumpError::missing_tx()),
        };
        let trade = Trade {
            tx,
            pool: pool.lp_token.to_string(),
            buy_0,
            amount_0,
            amount_1,
            time: block.timestamp,
            trader: data.to.to_string(),
        };
        let mut conn = self.conn()?;
        store::add_trade(&mut conn, &trade)?;
        Ok(false)
    }

    async fn handle_sync(&mut self, log: Log<UniswapV2Pair::Sync>) -> Result<bool, PumpError> {
        let block = match self.try_block(&log)? {
            BlockKind::Block(block) => block,
            BlockKind::NumberOnly(number) => {
                self.pending_logs
                    .entry(number)
                    .or_insert_with(PendingLogs::default)
                    .syncs
                    .push(log);
                return Ok(false);
            }
        };
        let lp_token = log.address();
        let pool = self.get_pool(lp_token).await?;
        let data = log.data();
        let dex_price = Pool::sync_price(data);
        let ui_price = self.insert_price(&pool, dex_price, block)?;
        log::info!(
            "Pool {} price is {} at top of block {}",
            fmt_hex(lp_token),
            fmt_px(ui_price),
            block.number
        );
        Ok(false)
    }

    pub async fn flush_candle(
        &mut self,
        lp_token: Address,
        mut prices: Vec<BigDecimal>,
        block: Block,
    ) -> Result<(), PumpError> {
        if let Some(open) = self.opening_prices.remove(&(block.number, lp_token)) {
            prices.insert(0, open);
        };
        let price = models::NewPoolPrice::try_new(&lp_token, block, &prices)?;
        let mut conn = self.conn()?;

        // closing price of block N is opening price of block N+1
        let close = price.close.clone();
        self.opening_prices.insert((block.number + 1, lp_token), close);
        store::add_price(&mut conn, price)?;
        Ok(())
    }

    async fn flush_block(&mut self, block: Block) -> Result<(), PumpError> {
        self.block_timestamps.insert(block.number, block.timestamp);
        let pending_logs = self.pending_logs.remove(&block.number).unwrap_or_default();
        for log in pending_logs.wei_in_updates {
            self.handle_wei_in_updated(log).await?;
        }
        for log in pending_logs.deployed_to_dexs {
            self.handle_deploy(log).await?;
        }
        for log in pending_logs.syncs {
            self.handle_sync(log).await?;
        }
        for log in pending_logs.swaps {
            self.handle_swap(log).await?;
        }
        Ok(())
    }

    /// flush all of the candles we created for N=2 blocks ago
    pub async fn new_block(&mut self, block: Block) -> Result<(), PumpError> {
        if let Some(confirmed_block) = block.number.checked_sub(CONFIRMATIONS) {
            let (confirmed, block_prices) =
                self.prices.remove(&confirmed_block).unwrap_or_default();
            for (pool, prices) in block_prices {
                // this function is &mut self
                self.flush_candle(pool, prices, confirmed).await?;
            }
        }
        self.flush_block(block).await?;
        Ok(())
    }

    pub fn conn(&self) -> Result<PgConn, PumpError> {
        Ok(connect(&self.pool)?)
    }

    pub async fn block_stream(&self) -> Result<SubscriptionStream<Header>, PumpError> {
        self.ws.blocks().await
    }

    fn lp_tokens(&self) -> Vec<Address> {
        self.pools.iter().map(|(lp, _)| lp.clone()).collect()
    }

    pub async fn log_stream(&self) -> Result<SubscriptionStream<Log>, PumpError> {
        self.ws.pump_logs(self.lp_tokens()).await
    }
}
