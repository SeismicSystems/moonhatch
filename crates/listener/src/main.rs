mod handler;

use dotenv::dotenv;
use futures_util::{select, stream::StreamExt};
use handler::LogHandler;
use pump::{
    client::{block::Block, PumpClient},
    db::pool::establish_pool,
    error::PumpError,
};

#[tokio::main]
async fn main() -> Result<(), PumpError> {
    dotenv().ok();
    env_logger::Builder::from_default_env().target(env_logger::Target::Stdout).init();

    let rpc_url = std::env::var("RPC_URL").expect("Must set RPC_URL in .env");
    let client = PumpClient::new(&rpc_url).await?;
    let db_pool = establish_pool();
    let mut handler = LogHandler::new(db_pool, client).await?;

    log::info!("Initializing pubsub streams");

    let mut block_stream = handler.block_stream().await?.fuse();
    let mut log_stream = handler.log_stream().await?.fuse();

    log::info!("Listening to streams...");

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
                        match handler.handle_log(log).await {
                            Ok(false) =>  {}
                            Ok(true) => {
                                // restart the stream
                                log_stream = handler.log_stream().await?.fuse();
                            }
                            Err(e) => {
                                log::error!("Error handling log: {:?}", e);
                            }
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
