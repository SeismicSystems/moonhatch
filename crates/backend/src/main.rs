// src/main.rs
mod handlers;
mod state;

use axum::{
    http::{HeaderValue, Method},
    routing::{get, post},
    Router,
};
use dotenv::dotenv;
use std::net::SocketAddr;
use tower_http::cors::{Any, CorsLayer};

use crate::state::AppState;

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

    // Define sub-router to handle /coin/:id routes
    let coin_routes = Router::new()
        .route("/", get(handlers::get_coin_handler)) // GET /coin/:id/snippet
        .route("/upload", post(handlers::upload_file)) // POST /coin/:id/upload
        .route("/verify", post(handlers::verify_coin_handler));

    let coins_routes = Router::new()
        .route("/", get(handlers::get_all_coins_handler)) // GET /coins    
        .route("/create", post(handlers::create_coin_handler)); // POST /coins/create

    let pool_routes = Router::new().route("/prices", get(handlers::get_pool_prices));

    // Define the main router.
    let app = Router::new()
        .nest("/coin/:id", coin_routes)
        .nest("/coins", coins_routes)
        .nest("/pool/:pool", pool_routes)
        .with_state(app_state)
        .layer(cors);

    let addr = SocketAddr::from(([127, 0, 0, 1], 3000));
    println!("Listening on http://{}", addr);
    axum::Server::bind(&addr).serve(app.into_make_service()).await.unwrap();
}
