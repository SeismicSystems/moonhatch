use axum::{
    extract::{
        ws::{Message, WebSocket},
        State, WebSocketUpgrade,
    },
    response::IntoResponse,
};
use futures::{SinkExt, StreamExt};
use uuid::Uuid;

use crate::state::{AppState, WsState};

pub(crate) async fn ws_handler(
    ws: WebSocketUpgrade,
    State(state): State<AppState>,
) -> impl IntoResponse {
    ws.on_upgrade(|socket| handle_socket(socket, state.ws))
}

async fn handle_socket(socket: WebSocket, state: WsState) {
    let (mut sender, mut receiver) = socket.split();

    let client_id = Uuid::new_v4().to_string();

    let (tx, mut _rx) = tokio::sync::mpsc::channel(100);

    {
        let mut clients = state.clients.lock().unwrap();
        clients.insert(client_id.clone(), tx);
    }

    let mut broadcast_rx = state.tx.subscribe();

    // Create a simple signal channel for clean shutdown
    let (shutdown_tx, mut shutdown_rx) = tokio::sync::oneshot::channel();

    let client_id_clone = client_id.clone();
    let forwarding_task = tokio::spawn(async move {
        loop {
            tokio::select! {
                // Exit loop when shutdown signal received
                _ = &mut shutdown_rx => {
                    log::debug!("Shutdown signal received for client {}", client_id_clone);
                    break;
                },
                msg = broadcast_rx.recv() => {
                    if let Ok(msg) = msg {
                        log::debug!("Forwarding message to client {}: {}", client_id_clone, msg);
                        if let Err(e) = sender.send(Message::Text(msg)).await {
                            log::error!("Failed to send message to client {}: {:?}", client_id_clone, e);
                            break;
                        }
                    } else {
                        // Broadcast channel closed
                        break;
                    }
                }
            }
        }
    });

    let client_id_clone = client_id.clone();
    let client_task = tokio::spawn(async move {
        while let Some(Ok(msg)) = receiver.next().await {
            match msg {
                Message::Text(text) => {
                    // NOTE: handle client-to-server messages here if needed
                    log::debug!("Received message from client {}: {}", client_id_clone, text);
                }
                Message::Close(_) => {
                    log::debug!("Client {} sent close frame", client_id_clone);
                    break;
                }
                _ => {}
            }
        }

        // Signal the forwarding task to stop when client disconnects
        let _ = shutdown_tx.send(());
        log::debug!("Client {} disconnected in receiver task", client_id_clone);
    });

    tokio::select! {
        _ = forwarding_task => {},
        _ = client_task => {},
    }

    let mut clients = state.clients.lock().unwrap();
    clients.remove(&client_id);
    log::debug!("Client {} disconnected", client_id);
}
