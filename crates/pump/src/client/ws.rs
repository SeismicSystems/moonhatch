use crate::{client::contract_address::ContractAddresses, error::PumpError};
use alloy_primitives::Address;
use alloy_provider::{create_seismic_ws_provider, Provider, SeismicUnsignedWsProvider};
use alloy_pubsub::SubscriptionStream;
use alloy_rpc_types_eth::{Filter, Header, Log};
use alloy_transport::TransportError;

pub struct PumpWsClient {
    ws: SeismicUnsignedWsProvider,
    ca: ContractAddresses,
}

impl PumpWsClient {
    pub async fn new(chain_id: u64) -> Result<PumpWsClient, TransportError> {
        let ws_url = std::env::var("WS_RPC_URL").expect("Missing WS_RPC_URL in .env");
        let ws = create_seismic_ws_provider(ws_url).await?;
        Ok(PumpWsClient { ws, ca: ContractAddresses::new(chain_id) })
    }

    pub async fn pump_logs(
        &self,
        mut addresses: Vec<Address>,
    ) -> Result<SubscriptionStream<Log>, PumpError> {
        addresses.push(self.ca.pump);
        let pump_filter = Filter::new().address(addresses);
        let sub = self.ws.subscribe_logs(&pump_filter).await?;
        Ok(sub.into_stream())
    }

    pub async fn blocks(&self) -> Result<SubscriptionStream<Header>, PumpError> {
        let sub = self.ws.subscribe_blocks().await?;
        Ok(sub.into_stream())
    }
}
