pub mod coin;
pub mod dex;
pub mod factory;
pub mod pump;

use alloy_primitives::Address;
use alloy_provider::{
    create_seismic_provider_without_wallet, network::TransactionBuilder, Provider,
    SeismicPublicClient,
};
use alloy_rpc_types_eth::{Filter, TransactionInput, TransactionRequest};
use alloy_sol_types::{sol_data::Address as SolAddress, SolCall, SolEvent, SolType};
use axum::{http::StatusCode, response::IntoResponse};
use reqwest::Url;
use std::str::FromStr;

use coin::get_coin_calldata;
use dex::UniswapV2Router02::{factoryCall, WETHCall};
use factory::get_pair_calldata;
use pump::PumpRand::{CoinCreated, CoinGraduated, DeployedToDex};

pub use coin::SolidityCoin;

pub fn build_tx(to: Address, calldata: Vec<u8>) -> TransactionRequest {
    TransactionRequest::default()
        .with_to(to)
        .input(TransactionInput::new(calldata.into()))
}

struct ContractAddresses {
    pump: Address,
    #[allow(dead_code)]
    dex: Address,
    factory: Address,
    weth: Address,
}

impl ContractAddresses {
    fn new() -> ContractAddresses {
        let pump = Address::from_str("0xcf7ed3acca5a467e9e704c703e8d87f634fb0fc9").unwrap();
        let dex = Address::from_str("0x9fe46736679d2d9a65f0992f2272de9f3c7fa6e0").unwrap();
        let factory = Address::from_str("0xe7f1725e7734ce288f8367e1bb143e90bb3f0512").unwrap();
        let weth = Address::from_str("0x5fbdb2315678afecb367f032d93f642f64180aa3").unwrap();
        ContractAddresses {
            pump,
            dex,
            factory,
            weth,
        }
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
        let address_bytes = provider
            .call(&tx)
            .await
            .map_err(|_e| PumpError::WethNotFound)?;
        let address = SolAddress::abi_decode(&address_bytes, true)
            .map_err(|_| PumpError::FailedToDecodeAbi)?;
        Ok(address)
    }
}

#[derive(Debug)]
pub enum PumpError {
    CoinNotFound,
    WethNotFound,
    PairNotFound,
    FailedToDecodeAbi,
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
            PumpError::FailedToDecodeAbi => StatusCode::INTERNAL_SERVER_ERROR,
            PumpError::CoinNotFound | PumpError::PairNotFound | PumpError::WethNotFound => {
                StatusCode::NOT_FOUND
            }
        }
    }
}

pub struct PumpClient {
    pub provider: SeismicPublicClient,
    contracts: ContractAddresses,
}

impl PumpClient {
    pub fn new() -> PumpClient {
        let rpc_url = Url::from_str("http://127.0.0.1:8545").expect("invalid RPC_URL");
        let provider = create_seismic_provider_without_wallet(rpc_url);
        PumpClient {
            provider,
            contracts: ContractAddresses::new(),
        }
    }

    pub async fn get_coin(&self, coin_id: u32) -> Result<SolidityCoin, PumpError> {
        let tx = build_tx(self.contracts.pump, get_coin_calldata(coin_id));
        let bytes = self
            .provider
            .call(&tx)
            .await
            .map_err(|_| PumpError::CoinNotFound)?;
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

    pub fn created_filter(&self) -> Filter {
        Filter::new()
            .address(self.contracts.pump)
            .event_signature(CoinGraduated::SIGNATURE_HASH)
    }

    pub fn graduated_filter(&self) -> Filter {
        Filter::new()
            .address(self.contracts.pump)
            .event_signature(CoinCreated::SIGNATURE_HASH)
    }

    pub fn deployed_filter(&self) -> Filter {
        Filter::new()
            .address(self.contracts.pump)
            .event_signature(DeployedToDex::SIGNATURE_HASH)
    }
}
