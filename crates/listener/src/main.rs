mod handler;

use futures_util::stream::StreamExt;
use handler::LogHandler;

use pump::{client::PumpClient, db::pool::establish_pool, error::ListenerError};


#[tokio::main]
async fn main() -> Result<(), ListenerError> {
    let client = PumpClient::new();
    let db_pool = establish_pool();
    let handler = LogHandler::new(db_pool);

    let sub = match client.pump_logs().await {
        Ok(sub) => sub,
        Err(e) => {
            panic!("Error subscribing to logs: {:?}", e)
        }
    };
    let mut stream = sub.into_stream();
    while let Some(log) = stream.next().await {
        match handler.handle_log(log).await {
            Ok(_) => {}
            Err(e) => {
                println!("Error listening to log stream. {:?}", e);
            }
        };
    }

    Ok(())
}
