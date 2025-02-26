use alloy_primitives::{Address, FixedBytes};
use alloy_transport::TransportError;
use axum::{extract::multipart::MultipartError, http::StatusCode, response::IntoResponse};

use crate::error::listener::ListenerError;

#[derive(Debug, thiserror::Error)]
pub enum FileUploadError {
    #[error("Multipart upload error: {0:?}")]
    Multipart(MultipartError),
    #[error("No file uploaded")]
    NoFileUploaded,
}

#[derive(Debug, thiserror::Error)]
pub enum PumpError {
    #[error("Coin not found: {0:?}")]
    CoinNotFound(u32),
    #[error("WETH contract not found")]
    WethNotFound,
    #[error("Pair not found: {0:?}")]
    PairNotFound(Address),
    #[error("Failed to decode ABI")]
    FailedToDecodeAbi,
    #[error("{0:?}")]
    FileUpload(FileUploadError),
    #[error("R2D2 error: {0:?}")]
    R2D2(r2d2::Error),
    #[error("Diesel error: {0:?}")]
    Diesel(diesel::result::Error),
    #[error("Listener error: {0:?}")]
    Listener(ListenerError),
    #[error("Transport error: {0:?}")]
    TransportError(TransportError),
    #[error("Invalid address")]
    InvalidAddress,
    #[error("Failed to read file at {0:?}")]
    FailedToReadFile(String),
}

impl From<ListenerError> for PumpError {
    fn from(value: ListenerError) -> Self {
        PumpError::Listener(value)
    }
}

impl From<alloy_sol_types::Error> for PumpError {
    fn from(value: alloy_sol_types::Error) -> Self {
        PumpError::Listener(value.into())
    }
}

impl From<r2d2::Error> for PumpError {
    fn from(value: r2d2::Error) -> Self {
        PumpError::R2D2(value)
    }
}

impl From<TransportError> for PumpError {
    fn from(value: TransportError) -> Self {
        PumpError::TransportError(value)
    }
}

impl From<MultipartError> for PumpError {
    fn from(value: MultipartError) -> Self {
        PumpError::FileUpload(FileUploadError::Multipart(value))
    }
}

impl From<diesel::result::Error> for PumpError {
    fn from(value: diesel::result::Error) -> Self {
        PumpError::Diesel(value)
    }
}

impl IntoResponse for PumpError {
    fn into_response(self) -> axum::response::Response {
        let msg = format!("{:?}", self);
        let code: StatusCode = self.into();
        return (code, msg).into_response();
    }
}

impl Into<StatusCode> for PumpError {
    fn into(self) -> StatusCode {
        match self {
            PumpError::FailedToDecodeAbi | PumpError::R2D2(_) => StatusCode::INTERNAL_SERVER_ERROR,
            PumpError::CoinNotFound(_) | PumpError::PairNotFound(_) | PumpError::WethNotFound => {
                StatusCode::NOT_FOUND
            }
            PumpError::FileUpload(_) => StatusCode::BAD_REQUEST,
            PumpError::Diesel(e) => match e {
                // TODO
                _ => StatusCode::NOT_FOUND,
            },
            PumpError::Listener(_) => StatusCode::INTERNAL_SERVER_ERROR,
            PumpError::TransportError(_) => StatusCode::INTERNAL_SERVER_ERROR,
            PumpError::InvalidAddress => StatusCode::INTERNAL_SERVER_ERROR,
            PumpError::FailedToReadFile(_) => StatusCode::INTERNAL_SERVER_ERROR,
        }
    }
}

impl PumpError {
    pub fn no_upload() -> PumpError {
        PumpError::FileUpload(FileUploadError::NoFileUploaded)
    }

    pub fn unknown_topic(topic: Option<alloy_primitives::FixedBytes<32>>) -> PumpError {
        ListenerError::UnknownTopic(topic).into()
    }

    pub fn no_block_number() -> PumpError {
        ListenerError::NoBlockNumber.into()
    }

    pub fn no_prices(block: u64, pool: Address) -> PumpError {
        ListenerError::NoPrices(block, pool).into()
    }

    pub fn no_swap_price(pool: Address, tx: Option<FixedBytes<32>>) -> PumpError {
        ListenerError::NoSwapPrice(pool, tx).into()
    }

    pub fn wrong_block(log_block: u64, current_block: u64) -> PumpError {
        ListenerError::WrongBlock(log_block, current_block).into()
    }

    pub fn missing_tx() -> PumpError {
        ListenerError::MissingTransactionHash.into()
    }
}
