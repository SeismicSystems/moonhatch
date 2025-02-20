use alloy_primitives::Address;
use alloy_provider::network::TransactionBuilder;
use alloy_rpc_types_eth::{TransactionInput, TransactionRequest};

pub mod block;
mod contract_address;
pub mod pool;

mod http;
mod ws;

pub use http::PumpClient;
pub use ws::PumpWsClient;

pub fn build_tx(to: &Address, calldata: Vec<u8>) -> TransactionRequest {
    TransactionRequest::default().with_to(to.clone()).input(TransactionInput::new(calldata.into()))
}
