use alloy_transport::TransportError;
use axum::{extract::multipart::MultipartError, http::StatusCode, response::IntoResponse};

#[derive(Debug)]
pub enum FileUploadError {
    Multipart(MultipartError),
    NoFileUploaded,
}

#[derive(Debug)]
pub enum PumpError {
    CoinNotFound,
    WethNotFound,
    PairNotFound,
    FailedToDecodeAbi,
    FileUpload(FileUploadError),
    R2D2(r2d2::Error),
    Diesel(diesel::result::Error),
    Alloy(TransportError)
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

impl From<TransportError> for PumpError {
    fn from(value: TransportError) -> Self {
        PumpError::Alloy(value)
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
            PumpError::CoinNotFound | PumpError::PairNotFound | PumpError::WethNotFound => {
                StatusCode::NOT_FOUND
            }
            PumpError::FileUpload(_) => StatusCode::BAD_REQUEST,
            PumpError::Diesel(e) => match e {
                // TODO
                _ => StatusCode::NOT_FOUND,
            },
            PumpError::Alloy(_) => StatusCode::INTERNAL_SERVER_ERROR
        }
    }
}

impl PumpError {
    pub fn no_upload() -> PumpError {
        PumpError::FileUpload(FileUploadError::NoFileUploaded)
    }
}