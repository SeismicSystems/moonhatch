use futures::StreamExt;
use pump::{get_workspace_root, SOCKET_FILENAME};
use std::path::Path;
use tokio::net::UnixListener;
use tokio_stream::wrappers::UnixListenerStream;

use crate::state::WsState;

pub(crate) fn setup_unix_socket(state: WsState) {
    let workspace = get_workspace_root().unwrap();
    let folder = Path::new(&workspace);

    if !folder.exists() {
        // Create the directory and its parent directories if they don't exist
        std::fs::create_dir_all(folder).expect("Failed to create socket directory");
    }

    let path = folder.join(SOCKET_FILENAME);

    if Path::new(&path).exists() {
        std::fs::remove_file(&path).expect("Failed to remove existing socket file");
    }

    let unix_listener = UnixListener::bind(&path).expect("Failed to bind to Unix socket");
    let unix_stream = UnixListenerStream::new(unix_listener);

    // Start the Unix socket listener task
    let unix_state = state.clone();
    tokio::spawn(async move {
        handle_unix_socket(unix_stream, unix_state).await;
    });
}

async fn handle_unix_socket(mut unix_stream: UnixListenerStream, state: WsState) {
    while let Some(Ok(stream)) = unix_stream.next().await {
        let state_tx = state.tx.clone();

        tokio::spawn(async move {
            let mut buf = vec![0; 1024];
            let stream: tokio::net::UnixStream =
                tokio::net::UnixStream::from_std(stream.into_std().unwrap()).unwrap();

            loop {
                match stream.try_read(&mut buf) {
                    Ok(0) => {
                        // End of stream
                        break;
                    }
                    Ok(n) => {
                        // Convert bytes to string and broadcast to all WebSocket clients
                        if let Ok(message) = String::from_utf8(buf[..n].to_vec()) {
                            log::info!("Received from Unix socket: {}", message);
                            let _ = state_tx.send(message);
                        }
                    }
                    Err(ref e) if e.kind() == std::io::ErrorKind::WouldBlock => {
                        // Wait for the socket to be readable
                        tokio::task::yield_now().await;
                    }
                    Err(e) => {
                        log::error!("Error reading from Unix socket: {}", e);
                        break;
                    }
                }
            }
        });
    }
}
