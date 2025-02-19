use alloy_primitives::Address;
use alloy_provider::{Provider, SeismicPublicClient};
use alloy_sol_types::{sol_data::Address as SolAddress, SolCall, SolType};
use std::str::FromStr;

use crate::error::PumpError;
use crate::contract::dex::UniswapV2Router02::{factoryCall, WETHCall};
use crate::client::build_tx;

pub(crate) struct ContractAddresses {
    pub(crate) pump: Address,
    #[allow(dead_code)]
    pub(crate) dex: Address,
    pub(crate) factory: Address,
    pub(crate) weth: Address,
}

impl ContractAddresses {
    pub fn new() -> ContractAddresses {
        let pump = Address::from_str("0xcf7ed3acca5a467e9e704c703e8d87f634fb0fc9").unwrap();
        let dex = Address::from_str("0x9fe46736679d2d9a65f0992f2272de9f3c7fa6e0").unwrap();
        let factory = Address::from_str("0xe7f1725e7734ce288f8367e1bb143e90bb3f0512").unwrap();
        let weth = Address::from_str("0x5fbdb2315678afecb367f032d93f642f64180aa3").unwrap();
        ContractAddresses { pump, dex, factory, weth }
    }

    #[allow(dead_code)]
    async fn get_weth(provider: &SeismicPublicClient, dex: Address) -> Result<Address, PumpError> {
        let calldata = WETHCall {}.abi_encode();
        ContractAddresses::get_address(provider, dex, calldata).await
    }

    #[allow(dead_code)]
    async fn get_factory(
        provider: &SeismicPublicClient,
        dex: Address,
    ) -> Result<Address, PumpError> {
        let calldata = factoryCall {}.abi_encode();
        ContractAddresses::get_address(provider, dex, calldata).await
    }

    pub async fn get_address(
        provider: &SeismicPublicClient,
        to: Address,
        calldata: Vec<u8>,
    ) -> Result<Address, PumpError> {
        let tx = build_tx(to, calldata);
        let address_bytes = provider.call(&tx).await.map_err(|_e| PumpError::WethNotFound)?;
        let address = SolAddress::abi_decode(&address_bytes, true)
            .map_err(|_| PumpError::FailedToDecodeAbi)?;
        Ok(address)
    }
}
