mod handler;
mod sock;

use futures_util::{select, stream::StreamExt};
use handler::LogHandler;
use pump::{
    client::{block::Block, PumpClient},
    db::pool::establish_pool,
    error::PumpError,
    get_workspace_root,
};

#[tokio::main]
async fn main() -> Result<(), PumpError> {
    let workspace_root = get_workspace_root().expect("no workspace root");
    dotenv::from_path(format!("{}/.env", workspace_root)).ok();
    env_logger::init();

    let rpc_url = std::env::var("RPC_URL").expect("Must set RPC_URL in .env");
    let client = PumpClient::new(&rpc_url).await?;
    let db_pool = establish_pool();
    let mut handler = LogHandler::new(db_pool, client).await?;

    log::info!("Initializing pubsub streams");
    let mut block_stream = handler.block_stream().await?.fuse();
    let mut pump_stream = handler.pump_stream().await?.fuse();
    let mut pairs_stream = handler.pairs_stream().await?.fuse();

    log::info!("Listening to streams...");
    loop {
        select! {
            maybe_block = block_stream.next() => {
                match maybe_block {
                    Some(block) => {
                        let block: Block = block.into();
                        println!("Received block: {:?}", block);
                        match handler.new_block(block).await {
                            Ok(false) => {}
                            Ok(true) => {
                                println!("Resubscribing to pairs stream");
                                handler.ws.unsubscribe(pairs_stream.into_inner().id().clone()).await?;
                                pairs_stream = handler.pairs_stream().await?.fuse();
                            }
                            Err(e) => { log::error!("Error flushing prices for block {}: {:?}", block.number, e); }
                        }
                    },
                    None => {
                        log::warn!("Block stream ended.");
                        break;
                    }
                }
            },
            maybe_log = pump_stream.next() => {
                match maybe_log {
                    Some(log) => {
                        match handler.handle_log(log).await {
                            Ok(false) =>  {}
                            Ok(true) => {
                                // restart the stream
                                println!("Resubscribing to pairs stream");
                                handler.ws.unsubscribe(pairs_stream.into_inner().id().clone()).await?;
                                pairs_stream = handler.pairs_stream().await?.fuse();
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
            // maybe_log = pairs_stream.next() => {
            //     match maybe_log {
            //         Some(log) => {
            //             match handler.handle_log(log).await {
            //                 Err(e) => {
            //                     log::error!("Error handling log: {:?}", e);
            //                 }
            //                 Ok(_) => {}
            //             }
            //         },
            //         None => {
            //             log::warn!("Log stream ended.");
            //             break;
            //         }
            //     }
            // },
        }
    }
    Ok(())
}
