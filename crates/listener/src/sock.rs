use std::{io::prelude::*, os::unix::net::UnixStream};

use alloy_primitives::Address;
use bigdecimal::BigDecimal;
use pump::{
    db::models::Coin, error::ListenerError, get_workspace_root, ListenerUpdate, SOCKET_FILENAME,
};

pub struct SockWriter {
    stream: UnixStream,
}

impl SockWriter {
    pub(crate) fn try_new() -> Result<Self, ListenerError> {
        let path = format!("{}/{}", get_workspace_root().unwrap(), SOCKET_FILENAME);
        let stream = UnixStream::connect(&path)?;
        Ok(Self { stream })
    }

    fn write(&mut self, message: &ListenerUpdate) -> Result<(), ListenerError> {
        let message = serde_json::to_string(message)?;
        self.stream.write_all(message.as_bytes())?;
        Ok(())
    }

    pub(crate) fn write_verified_coin(&mut self, coin: Coin) -> Result<(), ListenerError> {
        self.write(&ListenerUpdate::VerifiedCoin(coin))
    }

    pub(crate) fn write_wei_in_updated(
        &mut self,
        coin_id: i64,
        total_wei_in: BigDecimal,
    ) -> Result<(), ListenerError> {
        self.write(&ListenerUpdate::WeiInUpdated { id: coin_id, wei_in: total_wei_in })
    }

    pub(crate) fn write_graduated_coin(&mut self, coin_id: i64) -> Result<(), ListenerError> {
        self.write(&ListenerUpdate::GraduatedCoin { id: coin_id })
    }

    pub(crate) fn write_deployed_to_dex(
        &mut self,
        coin_id: i64,
        deployed_pool: Address,
    ) -> Result<(), ListenerError> {
        self.write(&ListenerUpdate::DeployedToDex {
            id: coin_id,
            deployed_pool: deployed_pool.to_string(),
        })
    }
}
