import { Dispatch } from 'redux'

import { WEBSOCKET_URL } from '@/api'
import { updateCoin } from '@/store/slice'
import type { CoinUpdate } from '@/types/update'

class WebSocketService {
  private socket: WebSocket | null = null
  private dispatch: Dispatch | null = null
  private url: string
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectTimeout = 3000 // 3 seconds

  constructor(url: string) {
    this.url = url
  }

  // Initialize with Redux dispatch
  init(dispatch: Dispatch) {
    this.dispatch = dispatch
    this.connect()
    console.log('websocketService.init', this.url)
  }

  // Connect to WebSocket
  connect() {
    if (this.socket) {
      this.socket.close()
    }

    try {
      this.socket = new WebSocket(this.url)

      this.socket.onopen = () => {
        console.log('WebSocket connection established')
        this.reconnectAttempts = 0
      }

      this.socket.onmessage = (event) => {
        try {
          const update: CoinUpdate = JSON.parse(event.data)
          if (update.type === 'graduatedCoin') {
            update.data.graduated = true
          }

          // Validate that we have a proper update with at least an ID
          if (update) {
            if (this.dispatch) {
              this.dispatch(updateCoin(update))
            }
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }

      this.socket.onclose = () => {
        console.log('WebSocket connection closed')
        this.attemptReconnect()
      }

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error)
        // Socket will close automatically after an error
      }
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error)
      this.attemptReconnect()
    }
  }

  // Try to reconnect
  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(
        `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`
      )

      setTimeout(() => {
        this.connect()
      }, this.reconnectTimeout)
    } else {
      console.error('Max reconnect attempts reached. Giving up.')
    }
  }

  // Close the connection
  disconnect() {
    if (this.socket) {
      this.socket.close()
      this.socket = null
    }
  }

  // Check if the connection is active
  isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN
  }
}

// Create and export a singleton instance
export const websocketService = new WebSocketService(WEBSOCKET_URL)
console.log('websocketService', websocketService)
