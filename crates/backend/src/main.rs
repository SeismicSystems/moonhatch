// src/main.rs
mod db;
mod handlers;
mod models;
mod schema;

use aws_config::meta::region::RegionProviderChain;
use aws_sdk_s3::{config::Region, Client as S3Client};
use axum::{
    http::{HeaderValue, Method},
    routing::{get, post},
    Router,
};
use dotenv::dotenv;
use pump::client::PumpClient;
use pump::db_pool::{establish_pool, PgPool};
use std::{net::SocketAddr, sync::Arc};
use tower_http::cors::{Any, CorsLayer};

#[derive(Clone)]
pub struct AppState {
    pub s3_client: Arc<S3Client>,
    pub db_pool: PgPool,
    pub pump_client: Arc<PumpClient>,
}

impl AppState {
    async fn new() -> AppState {
        let region_provider =
            RegionProviderChain::default_provider().or_else(Region::new("us-east-1"));
        let aws_config = aws_config::from_env().region(region_provider).load().await;
        let s3_client = S3Client::new(&aws_config);
        let shared_s3_client = Arc::new(s3_client);

        let pump_client = PumpClient::new();

        // Establish the database pool.
        let db_pool = establish_pool();
        AppState {
            s3_client: shared_s3_client,
            db_pool,
            pump_client: Arc::new(pump_client),
        }
    }
}

#[tokio::main]
async fn main() {
    dotenv().ok();

    // Set up AWS S3.
    let app_state = AppState::new().await;

    // Set up CORS.
    let origin = "http://localhost:5173".parse::<HeaderValue>().unwrap();
    let cors = CorsLayer::new()
        .allow_origin(origin)
        .allow_methods(vec![Method::GET, Method::POST])
        .allow_headers(Any);

    // Define coin-related routes in a sub-router.
    let coin_routes = Router::new()
        .route("/upload", post(handlers::upload_file)) // POST /coin/:id
        .route("/", get(handlers::get_coin_handler)) // GET /coin/:id/snippet
        .route("/", post(handlers::create_coin_handler)) // POST /coin/create
        .route("/verify", post(handlers::verify_coin_handler));

    let pool_routes = Router::new().route("/prices", get(handlers::get_pool_prices));

    // Define the main router.
    let app = Router::new()
        .nest("/coin/:id", coin_routes)
        .nest("/pool/:pool", pool_routes)
        .route("/coins", get(handlers::get_all_coins_handler))
        .with_state(app_state)
        .layer(cors);

    let addr = SocketAddr::from(([127, 0, 0, 1], 3000));
    println!("Listening on http://{}", addr);
    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await
        .unwrap();
}
