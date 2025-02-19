mod contract_address;
pub mod block;
pub mod pool;
pub(crate) mod price;

use alloy_primitives::Address;
use alloy_provider::{
    create_seismic_provider_without_wallet, network::TransactionBuilder, Provider,
    SeismicPublicClient,
};
use alloy_pubsub::SubscriptionStream;
use alloy_rpc_types_eth::{Filter, Header, Log, TransactionInput, TransactionRequest};
use alloy_sol_types::SolType;
use contract_address::ContractAddresses;
use pool::Pool;
use reqwest::Url;
use std::str::FromStr;

use crate::{
    contract::{coin::get_coin_calldata, factory::get_pair_calldata, pair::{get_token0_calldata, get_token1_calldata}, SolidityCoin},
    error::PumpError,
};

pub fn build_tx(to: &Address, calldata: Vec<u8>) -> TransactionRequest {
    TransactionRequest::default().with_to(to.clone()).input(TransactionInput::new(calldata.into()))
}

pub struct PumpClient {
    provider: SeismicPublicClient,
    ca: ContractAddresses,
}

impl PumpClient {
    pub fn new() -> PumpClient {
        let rpc_url = Url::from_str("http://127.0.0.1:8545").expect("invalid RPC_URL");
        let provider = create_seismic_provider_without_wallet(rpc_url);
        PumpClient { provider, ca: ContractAddresses::new() }
    }

    pub async fn get_coin(&self, coin_id: u32) -> Result<SolidityCoin, PumpError> {
        let tx = build_tx(&self.ca.pump, get_coin_calldata(coin_id));
        let bytes = self.provider.call(&tx).await.map_err(|_| PumpError::CoinNotFound(coin_id))?;
        let coin =
            SolidityCoin::abi_decode(&bytes, true).map_err(|_| PumpError::FailedToDecodeAbi)?;
        Ok(coin)
    }

    pub async fn get_pair(&self, token: Address) -> Result<Address, PumpError> {
        let calldata = get_pair_calldata(token, self.ca.weth);
        ContractAddresses::get_address(&self.provider, &self.ca.factory, calldata)
            .await
            .map_err(|_| PumpError::PairNotFound(token))
    }

    pub async fn get_pool(&self, lp_token: Address) -> Result<Pool, PumpError> {
        let token0_calldata = get_token0_calldata();
        let token1_calldata = get_token1_calldata();

        let token_0 = ContractAddresses::get_address(&self.provider, &lp_token, token0_calldata)
            .await.map_err(|_| PumpError::PairNotFound(lp_token.clone()))?;
        let token_1 = ContractAddresses::get_address(&self.provider, &lp_token, token1_calldata)
            .await.map_err(|_| PumpError::PairNotFound(lp_token.clone()))?;
        Ok(Pool { lp_token, token_0, token_1 })
    }

    pub async fn pump_logs(&self) -> Result<SubscriptionStream<Log>, PumpError> {
        let pump_filter = Filter::new().address(self.ca.pump);
        let sub = self.provider.subscribe_logs(&pump_filter).await?;
        Ok(sub.into_stream())
    }

    pub async fn blocks(&self) -> Result<SubscriptionStream<Header>, PumpError> {
        let sub = self.provider.subscribe_blocks().await?;
        Ok(sub.into_stream())
    }

    pub fn weth(&self) -> Address {
        self.ca.weth
    }
}
