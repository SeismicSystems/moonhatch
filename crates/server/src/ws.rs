use std::path::Path;

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

    let client_id_clone = client_id.clone();
    let forwarding_task = tokio::spawn(async move {
        while let Ok(msg) = broadcast_rx.recv().await {
            log::debug!("Forwarding message to client {}: {}", client_id_clone, msg);
            match sender.send(Message::Text(msg)).await {
                Ok(_) => {}
                Err(e) => {
                    log::error!("Failed to send message to client {}: {:?}", client_id_clone, e);
                    break;
                }
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
