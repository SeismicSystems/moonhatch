use std::{io::prelude::*, os::unix::net::UnixStream};

use alloy_primitives::Address;
use bigdecimal::BigDecimal;
use pump::{db::models::Coin, error::ListenerError, SOCKET_PATH};
use serde::{Deserialize, Serialize};

pub struct SockWriter {
    stream: UnixStream,
}

#[derive(Debug, Serialize, Deserialize)]
pub(crate) enum WsUpdate {
    VerifiedCoin(Coin),
    WeiInUpdated { coin_id: i64, total_wei_in: BigDecimal },
    GraduatedCoin { coin_id: i64 },
    DeployedToDex { coin_id: i64, deployed_pool: String },
}

impl SockWriter {
    pub(crate) fn try_new() -> Result<Self, ListenerError> {
        let stream = UnixStream::connect(SOCKET_PATH)?;
        Ok(Self { stream })
    }

    fn write(&mut self, message: &WsUpdate) -> Result<(), ListenerError> {
        let message = serde_json::to_string(message)?;
        self.stream.write_all(message.as_bytes())?;
        Ok(())
    }

    pub(crate) fn write_verified_coin(&mut self, coin: Coin) -> Result<(), ListenerError> {
        self.write(&WsUpdate::VerifiedCoin(coin))
    }

    pub(crate) fn write_wei_in_updated(
        &mut self,
        coin_id: i64,
        total_wei_in: BigDecimal,
    ) -> Result<(), ListenerError> {
        self.write(&WsUpdate::WeiInUpdated { coin_id, total_wei_in })
    }

    pub(crate) fn write_graduated_coin(&mut self, coin_id: i64) -> Result<(), ListenerError> {
        self.write(&WsUpdate::GraduatedCoin { coin_id })
    }

    pub(crate) fn write_deployed_to_dex(
        &mut self,
        coin_id: i64,
        deployed_pool: Address,
    ) -> Result<(), ListenerError> {
        self.write(&WsUpdate::DeployedToDex { coin_id, deployed_pool: deployed_pool.to_string() })
    }
}
