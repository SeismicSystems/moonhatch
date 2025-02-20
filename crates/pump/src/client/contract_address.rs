use alloy_primitives::Address;
use alloy_provider::{Provider, SeismicUnsignedProvider};
use alloy_sol_types::{sol_data::Address as SolAddress, SolCall, SolType};
use std::str::FromStr;

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
    pub fn new() -> ContractAddresses {
        let pump = Address::from_str("0x712516e61c8b383df4a63cfe83d7701bce54b03e").unwrap();
        let router = Address::from_str("0x948b3c65b89df0b4894abe91e6d02fe579834f8f").unwrap();
        let factory = Address::from_str("0x71c95911e9a5d330f4d621842ec243ee1343292e").unwrap();
        let weth = Address::from_str("0x8464135c8f25da09e49bc8782676a84730c318bc").unwrap();
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
