use alloy_primitives::Address;
use alloy_provider::{Provider, SeismicUnsignedProvider};
use alloy_sol_types::{sol_data::Address as SolAddress, SolCall, SolType};
use std::fs;
use std::path::Path;
use serde::Deserialize;

use crate::{
    client::build_tx,
    contract::dex::UniswapV2Router02::{factoryCall, WETHCall},
    error::PumpError,
};

pub(crate) struct ContractAddresses {
    pub(crate) pump: Address,
    #[allow(dead_code)]
    pub(crate) router: Address,
    pub(crate) factory: Address,
    pub(crate) weth: Address,
}

impl ContractAddresses {
    pub fn new(chain_id: u64) -> ContractAddresses {
        let pump = extract_address(format!("contracts/pump/{}.json", chain_id)).unwrap();
        let router = extract_address(format!("contracts/router/{}.json", chain_id)).unwrap();
        let factory = extract_address(format!("contracts/factory/{}.json", chain_id)).unwrap();
        let weth = extract_address(format!("contracts/weth/{}.json", chain_id)).unwrap();
        ContractAddresses { pump, router, factory, weth }
    }

    #[allow(dead_code)]
    async fn get_weth(
        provider: &SeismicUnsignedProvider,
        router: &Address,
    ) -> Result<Address, PumpError> {
        let calldata = WETHCall {}.abi_encode();
        ContractAddresses::get_address(provider, router, calldata).await
    }

    #[allow(dead_code)]
    async fn get_factory(
        provider: &SeismicUnsignedProvider,
        router: &Address,
    ) -> Result<Address, PumpError> {
        let calldata = factoryCall {}.abi_encode();
        ContractAddresses::get_address(provider, router, calldata).await
    }

    pub async fn get_address(
        provider: &SeismicUnsignedProvider,
        to: &Address,
        calldata: Vec<u8>,
    ) -> Result<Address, PumpError> {
        let tx = build_tx(to, calldata);
        let address_bytes = provider.call(&tx).await.map_err(|_e| PumpError::WethNotFound)?;
        let address = SolAddress::abi_decode(&address_bytes, true)
            .map_err(|_| PumpError::FailedToDecodeAbi)?;
        Ok(address)
    }
}


#[derive(Deserialize)]
struct ContractData {
    address: Address,
}

pub fn extract_address<P: AsRef<Path> + ToString>(path: P) -> Result<Address, PumpError> {
    let path_str = path.to_string();
    let content = fs::read_to_string(&path_str).map_err(|_| PumpError::FailedToReadFile(path_str.clone()))?;
    let parsed: ContractData = serde_json::from_str(&content).map_err(|_| PumpError::FailedToReadFile(path_str))?;
    Ok(parsed.address)
}