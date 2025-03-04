use crate::{
    client::contract_address::ContractAddresses, contract::pair::UniswapV2Pair, error::PumpError,
};
use alloy_primitives::{Address, FixedBytes};
use alloy_provider::{Provider, ProviderBuilder, RootProvider, SeismicUnsignedWsProvider};
use alloy_pubsub::SubscriptionStream;
use alloy_rpc_types_eth::{Filter, Header, Log};
use alloy_sol_types::SolEvent;
use alloy_transport::{BoxTransport, TransportError};

#[derive(Debug, Clone)]
pub struct PumpWsClient {
    pub ws: RootProvider<BoxTransport>,
    ca: ContractAddresses,
}

impl PumpWsClient {
    pub async fn new(chain_id: u64) -> Result<PumpWsClient, TransportError> {
        let ws_url = std::env::var("WS_RPC_URL").expect("Missing WS_RPC_URL in .env");
        let ws = ProviderBuilder::new().on_builtin(&ws_url).await?;
        Ok(PumpWsClient { ws, ca: ContractAddresses::new(chain_id) })
    }

    pub async fn pump_logs(&self) -> Result<SubscriptionStream<Log>, PumpError> {
        let pump_filter = Filter::new().address(self.ca.pump);
        let sub = self.ws.subscribe_logs(&pump_filter).await?;
        Ok(sub.into_stream())
    }

    pub async fn pair_logs(
        &self,
        addresses: Vec<Address>,
    ) -> Result<SubscriptionStream<Log>, PumpError> {
        let filter = Filter::new().address(addresses).event_signature(vec![
            UniswapV2Pair::Swap::SIGNATURE_HASH,
            UniswapV2Pair::Sync::SIGNATURE_HASH,
        ]);
        let sub = self.ws.subscribe_logs(&filter).await?;
        Ok(sub.into_stream())
    }

    pub async fn blocks(&self) -> Result<SubscriptionStream<Header>, PumpError> {
        let sub = self.ws.subscribe_blocks().await?;
        Ok(sub.into_stream())
    }

    pub async fn unsubscribe(&self, sub_id: FixedBytes<32>) -> Result<(), PumpError> {
        self.ws.unsubscribe(sub_id)?;
        Ok(())
    }
}
