use aws_sdk_s3::primitives::ByteStream;
use axum::{
    extract::{Multipart, Path, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use serde::Serialize;

use pump::db::{models, store};

use crate::AppState;

#[derive(Serialize)]
struct CoinResponse {
    coin: models::Coin,
}

/// Handler for GET /coin/:id/snippet?length=50
pub(crate) async fn get_coin_handler(
    Path(coin_id): Path<i64>,
    State(state): State<AppState>,
) -> impl IntoResponse {
    let mut conn = match state.db_pool.get() {
        Ok(conn) => conn,
        Err(e) => {
            return (StatusCode::INTERNAL_SERVER_ERROR, format!("DB error: {}", e)).into_response()
        }
    };

    match store::get_coin(&mut conn, coin_id) {
        Ok(coin) => Json(CoinResponse { coin }).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, format!("Error: {}", e)).into_response(),
    }
}

/// Handler for GET /coin/:id/snippet?length=50
pub(crate) async fn get_pool_prices(
    Path(pool): Path<String>,
    State(state): State<AppState>,
) -> impl IntoResponse {
    let mut conn = match state.db_pool.get() {
        Ok(conn) => conn,
        Err(e) => {
            return (StatusCode::INTERNAL_SERVER_ERROR, format!("DB error: {}", e)).into_response()
        }
    };

    match store::get_pool_prices(&mut conn, pool, None, None, 100) {
        Ok(prices) => Json::<Vec<models::PoolPriceData>>(prices).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, format!("Error: {}", e)).into_response(),
    }
}

pub(crate) async fn verify_coin_handler(
    Path(coin_id): Path<i64>,
    State(state): State<AppState>,
) -> impl IntoResponse {
    let mut conn = match state.db_pool.get() {
        Ok(conn) => conn,
        Err(e) => {
            return (StatusCode::INTERNAL_SERVER_ERROR, format!("DB error: {}", e)).into_response()
        }
    };

    let client = &state.pump_client;
    let coin = match client.get_coin(coin_id as u32).await {
        Ok(coin) => coin,
        Err(pe) => return pe.into_response(),
    };
    // Perform the update operation
    match store::update_coin(&mut conn, coin_id, coin) {
        Ok(rows_affected) if rows_affected > 0 => {
            (StatusCode::OK, Json(format!("Coin {} verified successfully!", coin_id)))
                .into_response()
        }
        Ok(_) => {
            (StatusCode::NOT_FOUND, format!("Coin with id {} not found", coin_id)).into_response()
        }
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, format!("Error updating coin: {}", e))
            .into_response(),
    }
}

pub(crate) async fn get_all_coins_handler(State(state): State<AppState>) -> impl IntoResponse {
    let mut conn = match state.db_pool.get() {
        Ok(conn) => conn,
        Err(e) => {
            return (StatusCode::INTERNAL_SERVER_ERROR, format!("DB error: {}", e)).into_response()
        }
    };

    match store::get_all_coins(&mut conn) {
        Ok(coin_list) => Json(coin_list).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, format!("Error fetching coins: {}", e))
            .into_response(),
    }
}
/// Handler for POST /coin/create
pub(crate) async fn create_coin_handler(
    State(state): State<AppState>,
    Json(payload): Json<models::NewCoin>,
) -> impl IntoResponse {
    let mut conn = match state.db_pool.get() {
        Ok(conn) => conn,
        Err(e) => {
            return (StatusCode::INTERNAL_SERVER_ERROR, format!("DB error: {}", e)).into_response()
        }
    };

    match store::create_coin(&mut conn, payload) {
        Ok(coin) => Json(CoinResponse { coin }).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, format!("Error: {}", e)).into_response(),
    }
}

pub(crate) async fn upload_file(
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
            return (StatusCode::BAD_REQUEST, "No file found in upload".to_string());
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
            (StatusCode::INTERNAL_SERVER_ERROR, "Upload failed".to_string())
        }
    }
}
