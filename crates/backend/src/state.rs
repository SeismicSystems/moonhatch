use aws_config::meta::region::RegionProviderChain;
use aws_sdk_s3::{config::Region, Client as S3Client};
use pump::{
    client::PumpClient,
    db::db_pool::{establish_pool, PgPool},
};
use std::sync::Arc;

#[derive(Clone)]
pub struct AppState {
    pub s3_client: Arc<S3Client>,
    pub db_pool: PgPool,
    pub pump_client: Arc<PumpClient>,
}

impl AppState {
    pub async fn new() -> AppState {
        let region_provider =
            RegionProviderChain::default_provider().or_else(Region::new("us-east-1"));
        let aws_config = aws_config::from_env().region(region_provider).load().await;
        let s3_client = S3Client::new(&aws_config);
        let shared_s3_client = Arc::new(s3_client);

        let pump_client = PumpClient::new();

        // Establish the database pool.
        let db_pool = establish_pool();
        AppState { s3_client: shared_s3_client, db_pool, pump_client: Arc::new(pump_client) }
    }
}
