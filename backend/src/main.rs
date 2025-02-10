// main.rs

use aws_config::meta::region::RegionProviderChain;
use axum::{
    extract::{Multipart, Path, State},
    http::StatusCode,
    response::IntoResponse,
    routing::post,
    Router,
};
use aws_sdk_s3::{config::Region, primitives::ByteStream, Client as S3Client};
use std::{net::SocketAddr, sync::Arc};
use tower_http::cors::{Any, CorsLayer};
use axum::http::HeaderValue;
use dotenv::dotenv;

#[tokio::main]
async fn main() {
    dotenv().ok();
    // Load the AWS configuration from the environment (this picks up AWS_ACCESS_KEY_ID, etc.)
    let region_provider = RegionProviderChain::default_provider()
        .or_else(Region::new("us-east-1"));

    let aws_config = aws_config::from_env().region(region_provider).load().await;
    let s3_client = S3Client::new(&aws_config);

    // Wrap the S3 client in an Arc so it can be shared with each request handler.
    let shared_s3_client = Arc::new(s3_client);

    // Set up a CORS layer to allow requests from http://localhost:5173.
    let origin = "http://localhost:5173".parse::<HeaderValue>().unwrap();
    let cors = CorsLayer::new()
        .allow_origin(origin)
        .allow_methods(Any)
        .allow_headers(Any);

    // Build the Axum router with the endpoint.
    let app = Router::new()
        .route("/coin/:id", post(upload_file))
        .with_state(shared_s3_client)
        .layer(cors);

    // Bind and run the server.
    let addr = SocketAddr::from(([127, 0, 0, 1], 3000));
    println!("Listening on http://{}", addr);
    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await
        .unwrap();
}

/// Handler for POST /coin/:id
///
/// Expects a multipart form upload with a file (any field that has a filename)
/// and writes the file content to S3 under the key "pump/<coin_id>".
/// Returns the full URL to the public asset.
async fn upload_file(
    // Extract the S3 client from shared state.
    State(s3_client): State<Arc<S3Client>>,
    // Extract the coin id from the URL path.
    Path(coin_id): Path<String>,
    // Extract the multipart form data.
    mut multipart: Multipart,
) -> impl IntoResponse {
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
                    "Failed to read file".to_string(),
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
            )
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
