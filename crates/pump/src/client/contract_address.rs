use alloy_primitives::Address;
use alloy_provider::{Provider, SeismicUnsignedProvider};
use alloy_sol_types::{sol_data::Address as SolAddress, SolCall, SolType};
use std::fs;
use std::path::Path;
use serde::Deserialize;
use cargo_metadata::MetadataCommand;
use std::path::PathBuf;

use crate::{
    client::build_tx,
    contract::dex::UniswapV2Router02::{factoryCall, WETHCall},
    error::PumpError,
};

#[derive(Debug, Clone)]
pub struct ContractAddresses {
    pub pump: Address,
    pub router: Address,
    pub factory: Address,
    pub weth: Address,
}


/// Returns the workspace root by invoking `cargo metadata`.
fn get_workspace_root() -> Option<PathBuf> {
    let metadata = MetadataCommand::new().exec().ok()?;
    Some(metadata.workspace_root.into())
}

fn contract_path(chain_id: u64, contract: &str) -> String {
    format!("{}/frontend/web/public/chains/{}/contracts/{}.json", get_workspace_root().unwrap().to_string_lossy(), chain_id, contract)
}

impl ContractAddresses {
    pub fn new(chain_id: u64) -> ContractAddresses {
        let pump = extract_address(contract_path(chain_id, "PumpRand")).unwrap();
        let router = extract_address(contract_path(chain_id, "UniswapV2Router02")).unwrap();
        let factory = extract_address(contract_path(chain_id, "UniswapV2Factory")).unwrap();
        let weth = extract_address(contract_path(chain_id, "WETH9")).unwrap();
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