use alloy_network::EthereumWallet;
use alloy_primitives::{hex::FromHex, Address, FixedBytes, B256};
use alloy_provider::{
    network::TransactionBuilder, Provider, SeismicSignedProvider, SeismicUnsignedProvider,
};
use alloy_rpc_types_eth::{Header, TransactionInput, TransactionRequest};
use alloy_signer_local::LocalSigner;
use alloy_sol_types::{sol_data::Bool, SolType};
use alloy_transport::TransportError;
use reqwest::Url;
use std::str::FromStr;

use crate::{
    client::{contract_address::ContractAddresses, pool::Pool},
    contract::{
        coin::{get_coin_calldata, get_graduated_calldata},
        factory::get_pair_calldata,
        pair::{get_token0_calldata, get_token1_calldata},
        pump::deploy_graduated_bytecode,
        SolidityCoin,
    },
    error::PumpError,
};

pub fn build_tx(to: &Address, calldata: Vec<u8>) -> TransactionRequest {
    TransactionRequest::default().with_to(to.clone()).input(TransactionInput::new(calldata.into()))
}

#[derive(Debug)]
pub struct PumpClient {
    pub chain_id: u64,
    provider: SeismicUnsignedProvider,
    wallet: SeismicSignedProvider,
    signer_address: Address,
    pub ca: ContractAddresses,
}

impl PumpClient {
    pub async fn new(rpc_url: &str) -> Result<PumpClient, PumpError> {
        let rpc_url = Url::from_str(rpc_url).expect("Missing RPC_URL in .env");
        let provider = SeismicUnsignedProvider::new(rpc_url.clone());

        let chain_id = provider.get_chain_id().await?;

        let private_key =
            std::env::var("DEPLOYER_PRIVATE_KEY").expect("Missing DEPLOYER_PRIVATE_KEY in .env");
        let pk_bytes = B256::from_hex(private_key).unwrap();
        let signer = LocalSigner::from_bytes(&pk_bytes).expect("invalid signer");
        let signer_address = signer.address();
        let wallet = SeismicSignedProvider::new(EthereumWallet::new(signer), rpc_url);

        Ok(PumpClient {
            provider,
            wallet,
            signer_address,
            ca: ContractAddresses::new(chain_id),
            chain_id,
        })
    }

    pub async fn get_chain_id(&self) -> Result<u64, PumpError> {
        let chain_id = self.provider.get_chain_id().await?;
        Ok(chain_id)
    }

    pub async fn get_coin(&self, coin_id: u32) -> Result<SolidityCoin, PumpError> {
        let tx = build_tx(&self.ca.pump, get_coin_calldata(coin_id));
        let bytes = self.provider.call(&tx).await.map_err(|_e| PumpError::CoinNotFound(coin_id))?;
        let coin =
            SolidityCoin::abi_decode(&bytes, true).map_err(|_| PumpError::FailedToDecodeAbi)?;
        Ok(coin)
    }

    pub async fn get_graduated(&self, coin_id: u32) -> Result<bool, PumpError> {
        let tx = build_tx(&self.ca.pump, get_graduated_calldata(coin_id));
        let bytes = self.provider.call(&tx).await.map_err(|_e| PumpError::CoinNotFound(coin_id))?;
        let graduated = Bool::abi_decode(&bytes, true).map_err(|_| PumpError::FailedToDecodeAbi)?;
        Ok(graduated)
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
            .await
            .map_err(|_| PumpError::PairNotFound(lp_token.clone()))?;
        let token_1 = ContractAddresses::get_address(&self.provider, &lp_token, token1_calldata)
            .await
            .map_err(|_| PumpError::PairNotFound(lp_token.clone()))?;
        Ok(Pool { lp_token, token_0, token_1 })
    }

    pub fn weth(&self) -> Address {
        self.ca.weth
    }

    pub fn router(&self) -> Address {
        self.ca.router
    }

    pub async fn deploy_graduated(&self, coin_id: u32) -> Result<FixedBytes<32>, TransportError> {
        let input = deploy_graduated_bytecode(coin_id);
        let tx = TransactionRequest::default()
            .to(self.ca.pump)
            .input(input.into())
            .from(self.signer_address);
        let inner = (*self.wallet).clone();
        let pending_tx = inner.send_transaction(tx).await?;
        Ok(pending_tx.tx_hash().clone())
    }

    pub async fn get_block_header(&self, block_number: u64) -> Result<Header, PumpError> {
        let block = self
            .provider
            .get_block_by_number(
                block_number.into(),
                alloy_rpc_types_eth::BlockTransactionsKind::Hashes,
            )
            .await?;
        match block {
            Some(block) => Ok(block.header),
            None => Err(PumpError::NoBlockWithNumber(block_number)),
        }
    }
}
