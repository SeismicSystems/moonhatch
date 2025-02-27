use aws_config::meta::region::RegionProviderChain;
use aws_sdk_s3::{config::Region, Client as S3Client};
use std::{
    collections::HashMap,
    sync::{Arc, Mutex},
};
use tokio::sync::broadcast::{self, Sender};

use pump::{
    client::PumpClient,
    db::pool::{self, connect, PgConn},
    error::PumpError,
};

#[derive(Clone)]
pub struct WsState {
    pub tx: Sender<String>,
    pub clients: Arc<Mutex<HashMap<String, tokio::sync::mpsc::Sender<String>>>>,
}

#[derive(Clone)]
pub struct AppState {
    pub s3_client: Arc<S3Client>,
    pub db_pool: pool::PgPool,
    pub pump_client: Arc<PumpClient>,
    pub ws: WsState,
}

impl AppState {
    pub async fn new() -> Result<AppState, PumpError> {
        let (tx, _rx) = broadcast::channel(100);

        let region_provider =
            RegionProviderChain::default_provider().or_else(Region::new("us-east-1"));
        let aws_config = aws_config::from_env().region(region_provider).load().await;
        let s3_client = S3Client::new(&aws_config);
        let shared_s3_client = Arc::new(s3_client);

        let pump_client =
            PumpClient::new(&std::env::var("RPC_URL").expect("Must set RPC_URL in .env")).await?;

        // Establish the database pool.
        let db_pool = pool::establish_pool();

        Ok(AppState {
            s3_client: shared_s3_client,
            db_pool,
            pump_client: Arc::new(pump_client),
            ws: WsState { tx: tx.clone(), clients: Arc::new(Mutex::new(HashMap::new())) },
        })
    }

    pub fn db_conn(&self) -> Result<PgConn, PumpError> {
        Ok(connect(&self.db_pool)?)
    }
}
