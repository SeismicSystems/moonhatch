use alloy_primitives::FixedBytes;
use alloy_provider::Provider;
use alloy_rpc_types_eth::Log;
use alloy_sol_types::SolEvent;
use alloy_transport::TransportError;
use futures_util::stream::StreamExt;
use pump::{
    client::{
        pump::PumpRand::{CoinCreated, CoinGraduated, DeployedToDex},
        PumpClient,
    },
    db_pool::{establish_pool, PgPool},
};

#[derive(Debug, thiserror::Error)]
enum ListenerError {
    #[error("Transport error: {0:?}")]
    TransportError(TransportError),
    #[error("Log decoding error: {0:?}")]
    LogDecodeError(alloy_sol_types::Error),
    #[error("Unknown topic: {0:?}")]
    UnknownTopic(Option<FixedBytes<32>>),
}

impl From<TransportError> for ListenerError {
    fn from(value: TransportError) -> Self {
        ListenerError::TransportError(value)
    }
}

impl From<alloy_sol_types::Error> for ListenerError {
    fn from(value: alloy_sol_types::Error) -> Self {
        ListenerError::LogDecodeError(value)
    }
}

async fn handle_log(log: Log, db_pool: &PgPool) -> Result<(), ListenerError> {
    match log.topic0() {
        Some(&CoinCreated::SIGNATURE_HASH) => {
            handle_creation(log.log_decode::<CoinCreated>()?, db_pool).await
        }
        Some(&CoinGraduated::SIGNATURE_HASH) => {
            handle_graduation(log.log_decode::<CoinGraduated>()?, db_pool).await
        }
        Some(&DeployedToDex::SIGNATURE_HASH) => {
            handle_deploy(log.log_decode::<DeployedToDex>()?, db_pool).await
        }
        topic => Err(ListenerError::UnknownTopic(topic.cloned())),
    }
}

async fn handle_creation(log: Log<CoinCreated>, db_pool: &PgPool) -> Result<(), ListenerError> {
    Ok(())
}

async fn handle_graduation(log: Log<CoinGraduated>, db_pool: &PgPool) -> Result<(), ListenerError> {
    Ok(())
}

async fn handle_deploy(log: Log<DeployedToDex>, db_pool: &PgPool) -> Result<(), ListenerError> {
    Ok(())
}

#[tokio::main]
async fn main() -> Result<(), ListenerError> {
    let client = PumpClient::new();
    let db_pool = establish_pool();

    let sub = match client.provider.subscribe_logs(&client.pump_filter()).await {
        Ok(sub) => sub,
        Err(e) => {
            panic!("Error subscribing to logs: {:?}", e)
        }
    };
    let mut stream = sub.into_stream();
    while let Some(log) = stream.next().await {
        match handle_log(log, &db_pool).await {
            Ok(_) => {}
            Err(e) => {
                println!("Error listening to log stream. {:?}", e);
            }
        };
    }

    Ok(())
}
