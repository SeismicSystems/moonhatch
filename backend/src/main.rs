// src/main.rs
use crate::db::create_coin;
use crate::models::Coin;
use crate::schema::coins::dsl::{coins, id, verified};

use axum::{
    extract::{Multipart, Path, Query, State},
    http::{HeaderValue, Method, StatusCode},
    response::IntoResponse,
    routing::{get, post},
    Json, Router,
};
use db::NewCoin;
use dotenv::dotenv;
use std::{collections::HashMap, net::SocketAddr, sync::Arc};
use tower_http::cors::{Any, CorsLayer};

// Declare our modules.
mod db;
mod db_pool;
mod models;
mod schema;

use aws_config::meta::region::RegionProviderChain;
use aws_sdk_s3::{config::Region, primitives::ByteStream, Client as S3Client};
use db_pool::{establish_pool, PgPool};

#[derive(Clone)]
pub struct AppState {
    pub s3_client: Arc<S3Client>,
    pub db_pool: PgPool,
}

use diesel::prelude::*;
use serde::Serialize;
#[derive(Serialize)]
struct CoinResponse {
    coin: Coin,
}

/// Handler for GET /coin/:id/snippet?length=50
async fn get_coin_handler(
    Path(coin_id): Path<i64>,
    State(state): State<AppState>,
) -> impl IntoResponse {
    let mut conn = match state.db_pool.get() {
        Ok(conn) => conn,
        Err(e) => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                format!("DB error: {}", e),
            )
                .into_response()
        }
    };

    match db::get_coin(&mut conn, coin_id) {
        Ok(coin) => Json(CoinResponse { coin }).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, format!("Error: {}", e)).into_response(),
    }
}
async fn verify_coin_handler(
    Path(coin_id): Path<i64>,
    State(state): State<AppState>,
) -> impl IntoResponse {
    let mut conn = match state.db_pool.get() {
        Ok(conn) => conn,
        Err(e) => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                format!("DB error: {}", e),
            )
                .into_response()
        }
    };

    // Perform the update operation
    match diesel::update(coins.filter(id.eq(coin_id)))
        .set(verified.eq(true))
        .execute(&mut conn)
    {
        Ok(rows_affected) if rows_affected > 0 => (
            StatusCode::OK,
            Json(format!("Coin {} verified successfully!", coin_id)),
        )
            .into_response(),
        Ok(_) => (
            StatusCode::NOT_FOUND,
            format!("Coin with id {} not found", coin_id),
        )
            .into_response(),
        Err(e) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("Error updating coin: {}", e),
        )
            .into_response(),
    }
}

async fn get_all_coins_handler(State(state): State<AppState>) -> impl IntoResponse {
    let mut conn = match state.db_pool.get() {
        Ok(conn) => conn,
        Err(e) => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                format!("DB error: {}", e),
            )
                .into_response()
        }
    };

    match db::get_all_coins(&mut conn) {
        Ok(coin_list) => Json(coin_list).into_response(),
        Err(e) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("Error fetching coins: {}", e),
        )
            .into_response(),
    }
}
/// Handler for POST /coin/create
async fn create_coin_handler(
    State(state): State<AppState>,
    Json(payload): Json<NewCoin>,
) -> impl IntoResponse {
    let mut conn = match state.db_pool.get() {
        Ok(conn) => conn,
        Err(e) => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                format!("DB error: {}", e),
            )
                .into_response()
        }
    };

    match create_coin(&mut conn, payload) {
        Ok(coin) => Json(CoinResponse { coin }).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, format!("Error: {}", e)).into_response(),
    }
}
/// Handler for POST /coin/:id (file upload)
async fn upload_file(
    State(state): State<AppState>,
    Path(coin_id): Path<String>,
    mut multipart: Multipart,
) -> impl IntoResponse {
    let s3_client = state.s3_client;

    let mut file_bytes: Option<Vec<u8>> = None;
    while let Some(field) = multipart.next_field().await.unwrap() {
        if field.file_name().is_some() {
            let data = match field.bytes().await {
                Ok(bytes) => bytes.to_vec(),
                Err(_) => {
                    return (
                        StatusCode::INTERNAL_SERVER_ERROR,
                        "File read error".to_string(),
                    )
                        .into_response()
                }
            };
            file_bytes = Some(data);
            break;
        }
    }

    let file_bytes = match file_bytes {
        Some(bytes) => bytes,
        None => return (StatusCode::BAD_REQUEST, "No file found".to_string()).into_response(),
    };

    let bucket_name = "seismic-public-assets";
    let key = format!("pump/{}", coin_id);

    let upload_result = s3_client
        .put_object()
        .bucket(bucket_name)
        .key(&key)
        .body(ByteStream::from(file_bytes))
        .acl(aws_sdk_s3::types::ObjectCannedAcl::PublicRead)
        .send()
        .await;

    match upload_result {
        Ok(_) => {
            let public_url = format!("https://{}.s3.amazonaws.com/{}", bucket_name, key);
            (StatusCode::OK, public_url).into_response()
        }
        Err(e) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("Upload error: {:?}", e),
        )
            .into_response(),
    }
}

#[tokio::main]
async fn main() {
    dotenv().ok();

    // Set up AWS S3.
    let region_provider = RegionProviderChain::default_provider().or_else(Region::new("us-east-1"));
    let aws_config = aws_config::from_env().region(region_provider).load().await;
    let s3_client = S3Client::new(&aws_config);
    let shared_s3_client = Arc::new(s3_client);

    // Establish the database pool.
    let db_pool = establish_pool();
    let app_state = AppState {
        s3_client: shared_s3_client,
        db_pool,
    };

    // Set up CORS.
    let origin = "http://localhost:5173".parse::<HeaderValue>().unwrap();
    let cors = CorsLayer::new()
        .allow_origin(origin)
        .allow_methods(vec![Method::GET, Method::POST])
        .allow_headers(Any);

    // Define coin-related routes in a sub-router.
    let coin_routes = Router::new()
        .route("/upload", post(upload_file)) // POST /coin/:id
        .route("/", get(get_coin_handler)) // GET /coin/:id/snippet
        .route("/", post(create_coin_handler)) // POST /coin/create
        .route("/verify", post(verify_coin_handler));

    // Define the main router.
    let app = Router::new()
        .nest("/coin/:id", coin_routes)
        .route("/coins", get(get_all_coins_handler))
        .with_state(app_state)
        .layer(cors);

    let addr = SocketAddr::from(([127, 0, 0, 1], 3000));
    println!("Listening on http://{}", addr);
    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await
        .unwrap();
}
