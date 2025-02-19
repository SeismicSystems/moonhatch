mod contract_address;

use alloy_primitives::Address;
use alloy_provider::{
    create_seismic_provider_without_wallet, network::TransactionBuilder, Provider,
    SeismicPublicClient,
};
use alloy_rpc_types_eth::{Filter, TransactionInput, TransactionRequest};
use alloy_sol_types::SolType;
use contract_address::ContractAddresses;
use reqwest::Url;
use std::str::FromStr;

use crate::{
    contract::{coin::get_coin_calldata, factory::get_pair_calldata, SolidityCoin},
    error::PumpError,
};

pub fn build_tx(to: Address, calldata: Vec<u8>) -> TransactionRequest {
    TransactionRequest::default().with_to(to).input(TransactionInput::new(calldata.into()))
}

pub struct PumpClient {
    provider: SeismicPublicClient,
    contracts: ContractAddresses,
}

impl PumpClient {
    pub fn new() -> PumpClient {
        let rpc_url = Url::from_str("http://127.0.0.1:8545").expect("invalid RPC_URL");
        let provider = create_seismic_provider_without_wallet(rpc_url);
        PumpClient { provider, contracts: ContractAddresses::new() }
    }

    pub async fn get_coin(&self, coin_id: u32) -> Result<SolidityCoin, PumpError> {
        let tx = build_tx(self.contracts.pump, get_coin_calldata(coin_id));
        let bytes = self.provider.call(&tx).await.map_err(|_| PumpError::CoinNotFound)?;
        let coin =
            SolidityCoin::abi_decode(&bytes, true).map_err(|_| PumpError::FailedToDecodeAbi)?;
        Ok(coin)
    }

    pub async fn get_pair(&self, token: Address) -> Result<Address, PumpError> {
        let calldata = get_pair_calldata(token, self.contracts.weth);
        ContractAddresses::get_address(&self.provider, self.contracts.factory, calldata)
            .await
            .map_err(|_| PumpError::PairNotFound)
    }

    pub fn pump_filter(&self) -> Filter {
        Filter::new().address(self.contracts.pump)
    }
}
