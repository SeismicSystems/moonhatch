mod handler;

use futures_util::{select, stream::StreamExt};
use handler::LogHandler;
use pump::{client::{block::Block, PumpClient}, db::pool::establish_pool, error::PumpError};

#[tokio::main]
async fn main() -> Result<(), PumpError> {
    env_logger::init();

    let client = PumpClient::new();
    let db_pool = establish_pool();
    let mut handler = LogHandler::new(db_pool, client);

    let mut block_stream = handler.block_stream().await?.fuse();
    let mut log_stream = handler.log_stream().await?.fuse();

    loop {
        select! {
            maybe_block = block_stream.next() => {
                match maybe_block {
                    Some(block) => {
                        let block: Block = block.into();
                        if let Err(e) = handler.new_block(block).await {
                            log::error!("Error flushing prices for block {}: {:?}", block.number, e);
                        }
                    },
                    None => {
                        log::warn!("Block stream ended.");
                        break;
                    }
                }
            },
            maybe_log = log_stream.next() => {
                match maybe_log {
                    Some(log) => {
                        if let Err(e) = handler.handle_log(log).await {
                            log::error!("Error handling log: {:?}", e);
                        }
                    },
                    None => {
                        log::warn!("Log stream ended.");
                        break;
                    }
                }
            },
        }
    }
    Ok(())
}
