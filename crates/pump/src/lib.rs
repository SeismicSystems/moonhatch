use std::path::PathBuf;

use bigdecimal::BigDecimal;
use cargo_metadata::MetadataCommand;
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

/// Returns the workspace root by invoking `cargo metadata`.
pub fn get_workspace_root() -> Option<String> {
    let path_buf: Option<PathBuf> = match std::env::var("WORKSPACE_ROOT") {
        Ok(workspace_root) => Some(PathBuf::from(workspace_root)),
        Err(_) => {
            let metadata = MetadataCommand::new().exec().ok()?;
            Some(metadata.workspace_root.into())
        }
    };
    match path_buf {
        Some(pb) => Some(format!("{}", pb.to_string_lossy())),
        None => None,
    }
}
