// src/main.rs
mod http;
mod sock;
mod state;
mod ws;

use std::net::SocketAddr;

use axum::{
    http::{HeaderValue, Method},
    routing::{get, post},
    Router,
};
use pump::get_workspace_root;
use tower_http::cors::{Any, CorsLayer};

use crate::state::AppState;

#[tokio::main]
async fn main() {
    let workspace_root = get_workspace_root().expect("no workspace root");
    dotenv::from_path(format!("{}/.env", workspace_root)).ok();
    env_logger::init();

    let app_state = AppState::new().await.expect("Failed to create app state");
    sock::setup_unix_socket(app_state.ws.clone());

    // CORS for local dev with vite frontend
    let origin = "http://localhost:5173".parse::<HeaderValue>().unwrap();
    let cors = CorsLayer::new()
        .allow_origin(origin)
        .allow_methods(vec![Method::GET, Method::POST])
        .allow_headers(Any);

    // Define sub-router to handle /coin/:id routes
    let coin_routes = Router::new()
        .route("/", get(http::get_coin_handler)) // GET /coin/:id/snippet
        .route("/upload", post(http::upload_file)) // POST /coin/:id/upload
        .route("/verify", post(http::verify_coin_handler))
        .route("/sync", post(http::sync_coin))
        .route("/deploy", post(http::deploy_coin));

    let coins_routes = Router::new()
        .route("/", get(http::get_all_coins_handler)) // GET /coins
        .route("/create", post(http::create_coin_handler)); // POST /coins/create

    let pool_routes = Router::new().route("/prices", get(http::get_pool_prices));

    // Define the main router.
    let app = Router::new()
        .route("/ws", get(ws::ws_handler))
        .route("/hall-of-fame", get(http::get_hall_of_fame))
        .nest("/coin/:id", coin_routes)
        .nest("/coins", coins_routes)
        .nest("/pool/:pool", pool_routes)
        .with_state(app_state)
        .layer(cors);

    let addr = SocketAddr::from(([127, 0, 0, 1], 3000));
    println!("Listening on http://{}", addr);
    axum::Server::bind(&addr).serve(app.into_make_service()).await.unwrap();
}
