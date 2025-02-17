// src/main.rs
use crate::db::create_coin;
use crate::models::Coin;
use crate::schema::coins::dsl::{coins as coins_table};
use crate::schema::{coins as coins_schema};

use abi::get_coin_tx;
use alloy_primitives::Address;
use alloy_sol_types::SolValue;
use axum::{
    extract::{Multipart, Path, State},
    http::{HeaderValue, Method, StatusCode},
    response::IntoResponse,
    routing::{get, post},
    Json, Router,
};
use reqwest::Url;
use db::NewCoin;
use dotenv::dotenv;
use std::str::FromStr;
use std::{net::SocketAddr, sync::Arc};
use tower_http::cors::{Any, CorsLayer};
use alloy_provider::{create_seismic_provider_without_wallet, Provider, SeismicPublicClient};

// Declare our modules.
mod db;
mod db_pool;
mod models;
mod schema;
mod abi;

use abi::{Coin as SolidityCoin};
use aws_config::meta::region::RegionProviderChain;
use aws_sdk_s3::{config::Region, primitives::ByteStream, Client as S3Client};
use db_pool::{establish_pool, PgPool};

#[derive(Clone)]
pub struct AppState {
    pub s3_client: Arc<S3Client>,
    pub db_pool: PgPool,
    pub seismic_client: Arc<SeismicPublicClient>,
    pub contract_address: Address,
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

    let client = state.seismic_client;
    let tx_req = get_coin_tx(state.contract_address, coin_id as u32);
    let coin = match client.call(&tx_req).await {
        Ok(response_bytes) => match SolidityCoin::abi_decode(&response_bytes, true) {
            Ok(coin) => coin,
            Err(_) => {
                return (StatusCode::INTERNAL_SERVER_ERROR, format!("Failed to parse coin id {}", coin_id)).into_response()    
            }
        },
        Err(_e) => {
            return (StatusCode::NOT_FOUND, format!("Coin with id {} not found", coin_id)).into_response();
        }
    };

    // Perform the update operation
    match diesel::update(coins_table.filter(schema::coins::id.eq(coin_id)))
        .set((
            coins_schema::verified.eq(true),
            coins_schema::supply.eq(bigdecimal::BigDecimal::from_str(&coin.supply.to_string()).unwrap()),
            coins_schema::name.eq(coin.name),
            coins_schema::symbol.eq(coin.symbol),
            coins_schema::contract_address.eq(coin.contractAddress.to_string()),
            coins_schema::creator.eq(coin.creator.to_string())
        ))
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

async fn upload_file(
    // Extract the S3 client from shared state.
    State(state): State<AppState>,
    // Extract the coin id from the URL path.
    Path(coin_id): Path<String>,
    // Extract the multipart form data.
    mut multipart: Multipart,
) -> impl IntoResponse {
    let s3_client = state.s3_client;
    // Look for the file field in the multipart form.
    let mut file_bytes: Option<Vec<u8>> = None;
    while let Some(field) = multipart.next_field().await.unwrap() {
        // Check if this field is a file (it will have a filename).
        if field.file_name().is_some() {
            // Read all bytes from the field.
            let data = if let Ok(bytes) = field.bytes().await {
                bytes.to_vec()
            } else {
                eprintln!("Error reading uploaded file");
                return (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    "Failed to read file as bytes".to_string(),
                );
            };
            file_bytes = Some(data);
            break;
        }
    }

    // If no file was provided, return a 400 error.
    let file_bytes = match file_bytes {
        Some(bytes) => bytes,
        None => {
            println!("bad request");
            return (
                StatusCode::BAD_REQUEST,
                "No file found in upload".to_string(),
            );
        }
    };

    // Prepare S3 upload parameters.
    let bucket_name = "seismic-public-assets";
    // The key will be under the "pump" folder with the filename equal to the coin id.
    let key = format!("pump/{}", coin_id);

    // Upload the file to S3 with the public-read ACL.
    let upload_result = s3_client
        .put_object()
        .bucket(bucket_name)
        .key(&key)
        .body(ByteStream::from(file_bytes))
        .acl(aws_sdk_s3::types::ObjectCannedAcl::PublicRead)
        .send()
        .await;

    // Check if the upload was successful.
    match upload_result {
        Ok(_) => {
            // Construct the public URL. (This example assumes the default AWS S3 endpoint.)
            let public_url = format!("https://{}.s3.amazonaws.com/{}", bucket_name, key);
            (StatusCode::OK, public_url)
        }
        Err(e) => {
            eprintln!("Error uploading to S3: {:?}", e);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                "Upload failed".to_string(),
            )
        }
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

    // TODO: load from .env
    // TODO: .env or load from file
    let contract_address = Address::from_str("0x5FbDB2315678afecb367f032d93F642f64180aa3").unwrap();
    let rpc_url = Url::from_str("http://127.0.0.1:8545").expect("invalid RPC_URL");
    let seismic_client = create_seismic_provider_without_wallet(rpc_url);

    // Establish the database pool.
    let db_pool = establish_pool();
    let app_state = AppState {
        s3_client: shared_s3_client,
        db_pool,
        seismic_client: Arc::new(seismic_client),
        contract_address
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
