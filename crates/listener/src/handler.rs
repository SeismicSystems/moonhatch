use alloy_primitives::Address;
use alloy_pubsub::SubscriptionStream;
use alloy_rpc_types_eth::{Header, Log};
use alloy_sol_types::SolEvent;
use bigdecimal::BigDecimal;
use chrono::{DateTime, NaiveDateTime};
use std::collections::HashMap;

use pump::{
    client::{block::Block, pool::Pool, PumpClient, PumpWsClient},
    contract::{pair::UniswapV2Pair, pump::PumpRand},
    db::{
        models,
        pool::{connect, PgConn, PgPool},
        store,
    },
    error::PumpError,
};

pub struct LogHandler {
    pool: PgPool,
    client: PumpClient,
    ws: PumpWsClient,
    block: Block,
    prices: HashMap<Address, Vec<BigDecimal>>,
    pools: HashMap<Address, Pool>,
}

impl LogHandler {
    pub async fn new(pool: PgPool, client: PumpClient) -> Result<LogHandler, PumpError> {
        let ws = PumpWsClient::new().await?;
        Ok(LogHandler {
            pool,
            client,
            ws,
            block: Block::default(),
            prices: HashMap::new(),
            pools: HashMap::new(),
        })
    }

    pub async fn handle_log(&mut self, log: Log) -> Result<(), PumpError> {
        match log.topic0() {
            Some(&PumpRand::CoinCreated::SIGNATURE_HASH) => {
                self.handle_creation(log.log_decode::<PumpRand::CoinCreated>()?).await
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

    async fn handle_creation(&self, log: Log<PumpRand::CoinCreated>) -> Result<(), PumpError> {
        let mut conn = self.conn()?;
        let coin_id = log.data().coinId;
        let coin = self.client.get_coin(coin_id).await?;
        log::info!("Coin[{}] created at {} by {}", coin_id, coin.contractAddress, coin.creator);
        store::upsert_verified(&mut conn, coin_id as i64, coin)?;
        Ok(())
    }

    async fn handle_graduation(&self, log: Log<PumpRand::CoinGraduated>) -> Result<(), PumpError> {
        let coin_id = log.data().coinId;
        let mut conn = self.conn()?;
        log::info!("Coin[{}] graduated in block {}", coin_id, log.block_number.unwrap_or_default());
        store::graduate_coin(&mut conn, coin_id as i64)?;
        let tx = self.client.deploy_graduated(coin_id).await?;
        log::info!("Called graduate({}), tx={}", coin_id, tx);
        Ok(())
    }

    async fn handle_deploy(&mut self, log: Log<PumpRand::DeployedToDex>) -> Result<(), PumpError> {
        let data = log.data();
        let mut conn = self.conn()?;
        let pool = self.get_pool(data.lpToken).await?;
        log::info!("Coin[{}] was to deployed to dex with LP address {}", data.coinId, data.lpToken);
        let created_at = DateTime::from_timestamp(log.block_timestamp.unwrap() as i64, 0).unwrap().naive_utc();
        let pool = models::Pool {
            address: pool.lp_token.to_string(),
            chain_id: 31337,
            dex: self.client.router().to_string(),
            token_a: pool.token_0.to_string(),
            token_b: pool.token_1.to_string(),
            created_at
        };
        store::upsert_deployed_pool(&mut conn, pool)?;
        store::update_deployed_pool(&mut conn, data.coinId as i64, data.lpToken)
    }

    fn try_block<T>(log: &Log<T>) -> Result<Block, PumpError> {
        match (log.block_number, log.block_timestamp) {
            (Some(number), Some(ts)) => Ok(Block { number, timestamp: ts as i64 }),
            _ => Err(PumpError::no_block_timestamp()),
        }
    }

    fn check_block<T>(&self, log: &Log<T>) -> Result<(), PumpError> {
        let block = LogHandler::try_block(log)?;
        match block.number == self.block.number {
            true => Ok(()),
            false => Err(PumpError::wrong_block(block.number, self.block.number)),
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

    fn insert_price(&mut self, pool: &Pool, dex_price: BigDecimal) -> Result<BigDecimal, PumpError> {
        let price = pool.to_ui_price(self.client.weth(), dex_price);
        self.prices.entry(pool.lp_token).or_insert(vec![]).push(price.clone());
        Ok(price)
    }

    async fn handle_swap(&mut self, log: Log<UniswapV2Pair::Swap>) -> Result<(), PumpError> {
        self.check_block(&log)?;
        let lp_token = log.address();
        let pool = self.get_pool(lp_token).await?;
        let data = log.data();
        let dex_price = match Pool::swap_price(data) {
            Some(px) => px,
            None => return Err(PumpError::no_swap_price(lp_token, log.transaction_hash)),
        };
        let ui_price = self.insert_price(&pool, dex_price)?;
        log::info!("Pool {} traded to price {} at top of block {}", lp_token, ui_price, log.block_number.unwrap_or_default());
        Ok(())
    }

    async fn handle_sync(&mut self, log: Log<UniswapV2Pair::Sync>) -> Result<(), PumpError> {
        self.check_block(&log)?;
        let lp_token = log.address();
        let pool = self.get_pool(lp_token).await?;
        let data = log.data();
        let dex_price = Pool::sync_price(data);
        let ui_price = self.insert_price(&pool, dex_price)?;
        log::info!("Pool {} price is {} at top of block {}", lp_token, ui_price, log.block_number.unwrap_or_default());
        Ok(())
    }

    pub async fn flush_candle(
        &mut self,
        lp_token: Address,
        prices: Vec<BigDecimal>,
    ) -> Result<(), PumpError> {
        let price = models::NewPoolPrice::try_new(&lp_token, self.block, &prices)?;
        let mut conn = self.conn()?;
        store::add_price(&mut conn, price)?;
        Ok(())
    }

    /// flush all of the candles we created for this block
    pub async fn new_block(&mut self, block: Block) -> Result<(), PumpError> {
        let prices = std::mem::take(&mut self.prices);
        for (pool, prices) in prices {
            // this function is &mut self
            self.flush_candle(pool, prices).await?;
        }
        self.block = block;
        // std::mem::take will auto-delete prices, but just for clarity:
        // self.prices = HashMap::new();
        Ok(())
    }

    pub fn conn(&self) -> Result<PgConn, PumpError> {
        Ok(connect(&self.pool)?)
    }

    pub async fn block_stream(&self) -> Result<SubscriptionStream<Header>, PumpError> {
        self.ws.blocks().await
    }

    pub async fn log_stream(&self) -> Result<SubscriptionStream<Log>, PumpError> {
        self.ws.pump_logs().await
    }
}
