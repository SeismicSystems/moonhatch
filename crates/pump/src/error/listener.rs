use alloy_primitives::FixedBytes;
use alloy_transport::TransportError;

#[derive(Debug, thiserror::Error)]
pub enum ListenerError {
    #[error("Transport error: {0:?}")]
    TransportError(TransportError),
    #[error("Log decoding error: {0:?}")]
    LogDecodeError(alloy_sol_types::Error),
    #[error("Unknown topic: {0:?}")]
    UnknownTopic(Option<FixedBytes<32>>),
}

impl From<TransportError> for ListenerError {
    fn from(value: TransportError) -> Self {
        ListenerError::TransportError(value)
    }
}

impl From<alloy_sol_types::Error> for ListenerError {
    fn from(value: alloy_sol_types::Error) -> Self {
        ListenerError::LogDecodeError(value)
    }
}
