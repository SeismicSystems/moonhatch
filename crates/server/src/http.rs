use aws_sdk_s3::primitives::ByteStream;
use axum::{
    extract::{Multipart, Path, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use chrono::Utc;
use serde::Serialize;

use pump::{
    db::{models, store},
    error::PumpError,
};

use crate::AppState;

#[derive(Serialize)]
struct CoinResponse {
    coin: models::Coin,
}

/// Handler for GET /coin/:id/snippet?length=50
pub(crate) async fn get_coin_handler(
    Path(coin_id): Path<i64>,
    State(state): State<AppState>,
) -> Result<impl IntoResponse, PumpError> {
    let mut conn = state.db_conn()?;
    let coin = store::get_coin(&mut conn, coin_id)?;
    Ok(Json(CoinResponse { coin }).into_response())
}

/// Handler for GET /coin/:id/snippet?length=50
pub(crate) async fn get_pool_prices(
    Path(pool): Path<String>,
    State(state): State<AppState>,
) -> Result<impl IntoResponse, PumpError> {
    let mut conn = state.db_conn()?;
    let prices = store::get_pool_prices(&mut conn, pool, None, None, 100)?;
    Ok(Json::<Vec<models::PoolPriceData>>(prices).into_response())
}

pub(crate) async fn verify_coin_handler(
    Path(coin_id): Path<i64>,
    State(state): State<AppState>,
) -> Result<impl IntoResponse, PumpError> {
    let mut conn = state.db_conn()?;

    let client = &state.pump_client;
    let coin = client.get_coin(coin_id as u32).await?;

    // Perform the update operation
    store::update_coin(&mut conn, coin_id, coin)?;
    Ok((StatusCode::OK, Json(format!("Coin {} verified successfully!", coin_id))).into_response())
}

pub(crate) async fn sync_coin(
    Path(coin_id): Path<i64>,
    State(state): State<AppState>,
) -> Result<impl IntoResponse, PumpError> {
    let mut conn = state.db_conn()?;
    let client = &state.pump_client;

    let coin = client.get_coin(coin_id as u32).await?;
    let token_address = coin.contractAddress.clone();
    store::update_coin(&mut conn, coin_id, coin)?;

    match client.get_pair(token_address).await {
        Ok(pair) => {
            let sol_pool = client.get_pool(pair).await?;

            let pool = models::Pool {
                address: sol_pool.lp_token.to_string(),
                chain_id: client.chain_id as i32,
                dex: client.ca.router.to_string(),
                token_0: sol_pool.token_0.to_string(),
                token_1: sol_pool.token_1.to_string(),
                created_at: Utc::now().naive_utc(),
            };
            store::upsert_deployed_pool(&mut conn, pool)?;
            store::update_deployed_pool(&mut conn, coin_id, sol_pool.lp_token)?;
            Ok((StatusCode::OK, Json(format!("Synced graduated coinId={}", coin_id)))
                .into_response())
        }
        Err(_e) => Ok((StatusCode::OK, Json(format!("Synced non-graduated coinId={}", coin_id)))
            .into_response()),
    }
}

pub(crate) async fn get_all_coins_handler(
    State(state): State<AppState>,
) -> Result<impl IntoResponse, PumpError> {
    let mut conn = state.db_conn()?;
    let coin_list = store::get_all_coins(&mut conn)?;
    Ok(Json(coin_list).into_response())
}

/// Handler for POST /coin/create
pub(crate) async fn create_coin_handler(
    State(state): State<AppState>,
    Json(payload): Json<models::NewCoin>,
) -> Result<impl IntoResponse, PumpError> {
    let mut conn = state.db_conn()?;
    let coin = store::upsert_unverified_coin(&mut conn, payload)?;
    Ok(Json(CoinResponse { coin }).into_response())
}

async fn parse_upload(mut multipart: Multipart) -> Result<Vec<u8>, PumpError> {
    // Look for the file field in the multipart form.
    let mut file_bytes: Option<Vec<u8>> = None;
    while let Some(field) = multipart.next_field().await.unwrap() {
        // Check if this field is a file (it will have a filename).
        if field.file_name().is_some() {
            // Read all bytes from the field.
            match field.bytes().await {
                Ok(bytes) => {
                    file_bytes = Some(bytes.to_vec());
                    break;
                }
                Err(e) => return Err(e.into()),
            };
        }
    }

    // If no file was provided, return a 400 error.
    match file_bytes {
        Some(bytes) => Ok(bytes),
        None => return Err(PumpError::no_upload()),
    }
}

pub(crate) async fn upload_file(
    // Extract the S3 client from shared state.
    State(state): State<AppState>,
    // Extract the coin id from the URL path.
    Path(coin_id): Path<String>,
    // Extract the multipart form data.
    multipart: Multipart,
) -> Result<impl IntoResponse, PumpError> {
    let s3_client = state.s3_client;

    // Prepare S3 upload parameters.
    let bucket_name = "seismic-public-assets";
    // The key will be under the "pump" folder with the filename equal to the coin id.
    let key = format!("pump/{}/{}", state.pump_client.chain_id, coin_id);

    let file_bytes = parse_upload(multipart).await?;

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
            Ok((StatusCode::OK, public_url).into_response())
        }
        Err(e) => {
            eprintln!("Error uploading to S3: {:?}", e);
            Ok((StatusCode::INTERNAL_SERVER_ERROR, "Upload failed".to_string()).into_response())
        }
    }
}
