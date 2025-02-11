// src/main.rs

use axum::{
    extract::{Multipart, Path, Query, State},
    http::{HeaderValue, Method, StatusCode},
    response::IntoResponse,
    routing::{get, post},
    Json, Router,
};
use dotenv::dotenv;
use std::{collections::HashMap, net::SocketAddr, sync::Arc};
use tower_http::cors::{Any, CorsLayer};

// Declare our modules.
mod models;
mod schema;
mod db;
mod db_pool;

use db_pool::{establish_pool, PgPool};
use aws_sdk_s3::{config::Region, primitives::ByteStream, Client as S3Client};
use aws_config::meta::region::RegionProviderChain;

#[derive(Clone)]
pub struct AppState {
    pub s3_client: Arc<S3Client>,
    pub db_pool: PgPool,
}

use serde::Serialize;
#[derive(Serialize)]
struct CoinSnippetResponse {
    snippet: String,
}

/// Handler for GET /coin/:id/snippet?length=50
async fn get_coin_snippet_handler(
    Path(coin_id): Path<i32>,
    Query(params): Query<HashMap<String, String>>,
    State(state): State<AppState>,
) -> impl IntoResponse {
    let snippet_length: usize = params
        .get("length")
        .and_then(|s| s.parse().ok())
        .unwrap_or(100);
        
    let mut conn = match state.db_pool.get() {
        Ok(conn) => conn,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, format!("DB error: {}", e)).into_response(),
    };
    
    match db::get_coin_snippet(&mut conn, coin_id, snippet_length) {
        Ok(snippet) => Json(CoinSnippetResponse { snippet }).into_response(),
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
                Err(_) => return (StatusCode::INTERNAL_SERVER_ERROR, "File read error".to_string()).into_response(),
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
    
    let upload_result = s3_client.put_object()
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
        },
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, format!("Upload error: {:?}", e)).into_response(),
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
        .route("/", post(upload_file))       // POST /coin/:id
        .route("/snippet", get(get_coin_snippet_handler)); // GET /coin/:id/snippet
    
    // Nest coin routes under /coin/:id.
    let app = Router::new()
        .nest("/coin/:id", coin_routes)
        .with_state(app_state)
        .layer(cors);
    
    let addr = SocketAddr::from(([127, 0, 0, 1], 3000));
    println!("Listening on http://{}", addr);
    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await
        .unwrap();
}
