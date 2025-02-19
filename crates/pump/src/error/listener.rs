use alloy_primitives::{Address, FixedBytes};

#[derive(Debug, thiserror::Error)]
pub enum ListenerError {
    #[error("Log decoding error: {0:?}")]
    LogDecodeError(alloy_sol_types::Error),
    #[error("Unknown topic: {0:?}")]
    UnknownTopic(Option<FixedBytes<32>>),
    #[error("No block timestamp")]
    NoBlockTimestamp,
    #[error("Block {0} has no prices for pool {1:?}")]
    NoPrices(u64, Address),
    #[error("Received no price for swap into pool {0:?} for tx {1:?}")]
    NoSwapPrice(Address, Option<FixedBytes<32>>),
    #[error("Received event for block {0}, but listener is on block {1}")]
    WrongBlock(u64, u64)
}

impl From<alloy_sol_types::Error> for ListenerError {
    fn from(value: alloy_sol_types::Error) -> Self {
        ListenerError::LogDecodeError(value)
    }
}
