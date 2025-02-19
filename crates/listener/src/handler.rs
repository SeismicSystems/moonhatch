use alloy_rpc_types_eth::Log;
use alloy_sol_types::SolEvent;
use pump::{
    contract::pump::PumpRand::{CoinCreated, CoinGraduated, DeployedToDex},
    db::pool::PgPool,
};

use crate::error::ListenerError;

pub struct LogHandler {
    pool: PgPool,
}

impl LogHandler {
    pub fn new(pool: PgPool) -> LogHandler {
        LogHandler { pool }
    }

    pub async fn handle_log(&self, log: Log) -> Result<(), ListenerError> {
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
            topic => Err(ListenerError::UnknownTopic(topic.cloned())),
        }
    }

    async fn handle_creation(&self, log: Log<CoinCreated>) -> Result<(), ListenerError> {
        // TODO: move db models & schema here
        println!("Log: {:?}", log);
        Ok(())
    }

    async fn handle_graduation(&self, log: Log<CoinGraduated>) -> Result<(), ListenerError> {
        // TODO: move db models & schema here
        println!("Log: {:?}", log);
        Ok(())
    }

    async fn handle_deploy(&self, log: Log<DeployedToDex>) -> Result<(), ListenerError> {
        // TODO: move db models & schema here
        println!("Log: {:?}", log);
        Ok(())
    }
}
