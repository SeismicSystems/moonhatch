use aws_config::meta::region::RegionProviderChain;
use aws_sdk_s3::{config::Region, Client as S3Client};
use std::sync::Arc;

use pump::{
    client::PumpClient,
    db::pool::{self, connect, PgConn},
    error::PumpError,
};

#[derive(Clone)]
pub struct AppState {
    pub s3_client: Arc<S3Client>,
    pub db_pool: pool::PgPool,
    pub pump_client: Arc<PumpClient>,
}

impl AppState {
    pub async fn new() -> Result<AppState, PumpError> {
        let region_provider =
            RegionProviderChain::default_provider().or_else(Region::new("us-east-1"));
        let aws_config = aws_config::from_env().region(region_provider).load().await;
        let s3_client = S3Client::new(&aws_config);
        let shared_s3_client = Arc::new(s3_client);

        let pump_client =
            PumpClient::new(&std::env::var("RPC_URL").expect("Must set RPC_URL in .env")).await?;

        // Establish the database pool.
        let db_pool = pool::establish_pool();

        Ok(AppState { s3_client: shared_s3_client, db_pool, pump_client: Arc::new(pump_client) })
    }

    pub fn db_conn(&self) -> Result<PgConn, PumpError> {
        Ok(connect(&self.db_pool)?)
    }
}
