use std::path::Path;

use axum::{
    extract::{
        ws::{Message, WebSocket},
        State, WebSocketUpgrade,
    },
    response::IntoResponse,
};
use futures::{SinkExt, StreamExt};
use pump::SOCKET_PATH;
use tokio::net::UnixListener;
use tokio_stream::wrappers::UnixListenerStream;
use uuid::Uuid;

use crate::state::AppState;

pub(crate) fn setup_unix_socket(state: AppState) {
    if Path::new(SOCKET_PATH).exists() {
        std::fs::remove_file(SOCKET_PATH).expect("Failed to remove existing socket file");
    }

    let unix_listener = UnixListener::bind(SOCKET_PATH).expect("Failed to bind to Unix socket");
    let unix_stream = UnixListenerStream::new(unix_listener);

    // Start the Unix socket listener task
    let unix_state = state.clone();
    tokio::spawn(async move {
        handle_unix_socket(unix_stream, unix_state).await;
    });
}

pub(crate) async fn ws_handler(
    ws: WebSocketUpgrade,
    State(state): State<AppState>,
) -> impl IntoResponse {
    ws.on_upgrade(|socket| handle_socket(socket, state))
}

pub(crate) async fn handle_socket(socket: WebSocket, state: AppState) {
    let (mut sender, mut receiver) = socket.split();

    let client_id = Uuid::new_v4().to_string();

    let (tx, mut _rx) = tokio::sync::mpsc::channel(100);

    {
        let mut clients = state.clients.lock().unwrap();
        clients.insert(client_id.clone(), tx);
    }

    let mut broadcast_rx = state.tx.subscribe();

    let client_id_clone = client_id.clone();
    let forwarding_task = tokio::spawn(async move {
        while let Ok(msg) = broadcast_rx.recv().await {
            log::debug!("Forwarding message to client {}: {}", client_id_clone, msg);
            if sender.send(Message::Text(msg)).await.is_err() {
                break;
            }
        }
    });

    let client_id_clone = client_id.clone();
    let client_task = tokio::spawn(async move {
        while let Some(Ok(Message::Text(text))) = receiver.next().await {
            log::debug!("Received message from client {}: {}", client_id_clone, text);
            // NOTE: handle client-to-server messages here if needed
        }
    });

    tokio::select! {
        _ = forwarding_task => {},
        _ = client_task => {},
    }

    let mut clients = state.clients.lock().unwrap();
    clients.remove(&client_id);
    log::debug!("Client {} disconnected", client_id);
}

pub(crate) async fn handle_unix_socket(mut unix_stream: UnixListenerStream, state: AppState) {
    while let Some(Ok(stream)) = unix_stream.next().await {
        let state_clone = state.clone();

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
                            let _ = state_clone.tx.send(message);
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
