use alloy_primitives::FixedBytes;

#[derive(Debug, thiserror::Error)]
pub enum ListenerError {
    #[error("Log decoding error: {0:?}")]
    LogDecodeError(alloy_sol_types::Error),
    #[error("Unknown topic: {0:?}")]
    UnknownTopic(Option<FixedBytes<32>>),
}

impl From<alloy_sol_types::Error> for ListenerError {
    fn from(value: alloy_sol_types::Error) -> Self {
        ListenerError::LogDecodeError(value)
    }
}
