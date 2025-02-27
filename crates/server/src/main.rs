// src/main.rs
mod http;
mod state;
mod ws;

use std::net::SocketAddr;

use axum::{
    http::{HeaderValue, Method},
    routing::{get, post},
    Router,
};
use dotenv::dotenv;
use tower_http::cors::{Any, CorsLayer};

use crate::state::AppState;

#[tokio::main]
async fn main() {
    dotenv().ok();
    env_logger::init();

    let app_state = AppState::new().await.expect("Failed to create app state");
    ws::setup_unix_socket(app_state.clone());

    // CORS for local dev with vite frontend
    let origin = "http://localhost:5173".parse::<HeaderValue>().unwrap();
    let cors = CorsLayer::new()
        .allow_origin(origin)
        .allow_methods(vec![Method::GET, Method::POST])
        .allow_headers(Any);

    // Define sub-router to handle /coin/:id routes
    let coin_routes = Router::new()
        .route("/ws", get(ws::ws_handler))
        .route("/", get(http::get_coin_handler)) // GET /coin/:id/snippet
        .route("/upload", post(http::upload_file)) // POST /coin/:id/upload
        .route("/verify", post(http::verify_coin_handler))
        .route("/sync", post(http::sync_coin));

    let coins_routes = Router::new()
        .route("/", get(http::get_all_coins_handler)) // GET /coins
        .route("/create", post(http::create_coin_handler)); // POST /coins/create

    let pool_routes = Router::new().route("/prices", get(http::get_pool_prices));

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
