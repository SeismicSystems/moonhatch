mod handler;

use futures_util::stream::StreamExt;
use handler::LogHandler;

use pump::{client::PumpClient, db::pool::establish_pool, error::PumpError};

#[tokio::main]
async fn main() -> Result<(), PumpError> {
    env_logger::init();

    let client = PumpClient::new();
    let db_pool = establish_pool();
    let handler = LogHandler::new(db_pool, client);

    let mut stream = handler.client.pump_logs().await?;
    while let Some(log) = stream.next().await {
        if let Err(e) = handler.handle_log(log).await {
            log::error!("Error listening to log stream: {:?}", e);
        };
    }

    Ok(())
}
