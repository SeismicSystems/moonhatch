use bigdecimal::BigDecimal;
use db::models::Coin;
use serde::{Deserialize, Serialize};

pub mod client;
pub mod contract;
pub mod db;
pub mod error;

pub const SOCKET_PATH: &str = "/tmp/listener.sock";

#[derive(Debug, Serialize, Deserialize)]
#[serde(tag = "type", content = "data")]
#[serde(rename_all = "camelCase")]
pub enum ListenerUpdate {
    VerifiedCoin(Coin),
    WeiInUpdated { coin_id: i64, total_wei_in: BigDecimal },
    GraduatedCoin { coin_id: i64 },
    DeployedToDex { coin_id: i64, deployed_pool: String },
}
