use alloy_rpc_types_eth::Log;
use alloy_sol_types::SolEvent;
use pump::{
    client::PumpClient, contract::pump::PumpRand::{CoinCreated, CoinGraduated, DeployedToDex}, db::{pool::{connect, PgConn, PgPool}, store}, error::PumpError
};

pub struct LogHandler {
    pool: PgPool,
    pub client: PumpClient,
}

impl LogHandler {
    pub fn new(pool: PgPool, client: PumpClient) -> LogHandler {
        LogHandler { pool, client }
    }

    pub async fn handle_log(&self, log: Log) -> Result<(), PumpError> {
        match log.topic0() {
            Some(&CoinCreated::SIGNATURE_HASH) => {
                self.handle_creation(log.log_decode::<CoinCreated>()?).await
            }
            Some(&CoinGraduated::SIGNATURE_HASH) => {
                self.handle_graduation(log.log_decode::<CoinGraduated>()?).await
            }
            Some(&DeployedToDex::SIGNATURE_HASH) => {
                self.handle_deploy(log.log_decode::<DeployedToDex>()?).await
            }
            topic => Err(PumpError::unknown_topic(topic.cloned())),
        }
    }

    async fn handle_creation(&self, log: Log<CoinCreated>) -> Result<(), PumpError> {
        let mut conn = self.conn()?;
        let coin_id = log.data().coinId;
        let coin = self.client.get_coin(coin_id).await?;
        store::update_coin(&mut conn, coin_id as i64, coin)
    }

    async fn handle_graduation(&self, log: Log<CoinGraduated>) -> Result<(), PumpError> {
        let coin_id = log.data().coinId;
        let mut conn = self.conn()?;
        store::graduate_coin(&mut conn, coin_id as i64)
    }

    async fn handle_deploy(&self, log: Log<DeployedToDex>) -> Result<(), PumpError> {
        let data = log.data();
        let mut conn = self.conn()?;
        store::update_deployed_pool(&mut conn, data.coinId as i64, data.lpToken)
    }

    pub fn conn(&self) -> Result<PgConn, PumpError> {
        Ok(connect(&self.pool)?)
    }
}
