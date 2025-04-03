import { NavigateFunction } from 'react-router-dom'
import { Dispatch } from 'redux'
import { parseEther } from 'viem'

import { sendWsToast } from '@/components/WsToast'
import { selectCoinById, updateCoin } from '@/store/slice'
import { RootState, store } from '@/store/store'
import { Coin } from '@/types/coin'
import type { CoinUpdate } from '@/types/update'

type SelectorFactory = (
  coinId: string
) => (state: RootState) => Coin | undefined
type CachedSelector = (coinId: string) => (state: RootState) => Coin | undefined

const createCachedSelectorGetter = (
  selectorFactory: SelectorFactory
): CachedSelector => {
  const cache = new Map()

  return (id: string) => {
    if (!cache.has(id)) {
      cache.set(id, selectorFactory(id))
    }
    return cache.get(id)
  }
}

// Create the cached getter
const getCoinSelector = createCachedSelectorGetter(selectCoinById)

class WebSocketService {
  private socket: WebSocket | null = null
  private dispatch: Dispatch | null = null
  private navigate: NavigateFunction | null = null
  private url: string
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectTimeout = 3000 // 3 seconds
  private reconnectOnClose = true

  constructor(url: string) {
    this.url = url
  }

  // Initialize with Redux dispatch
  init(dispatch: Dispatch, navigate: NavigateFunction) {
    this.dispatch = dispatch
    this.navigate = navigate
    this.connect()
  }

  onUpdate(update: CoinUpdate) {
    const onClick = () => {
      if (this.navigate) {
        this.navigate(`/coins/${update.data.id}`)
      }
    }

    if (update.type === 'verifiedCoin') {
      sendWsToast({
        coin: update.data,
        beforeSymbol: 'New coin created:',
        afterSymbol: '',
        onClick,
      })
      return
    }

    const coin = getCoinSelector(update.data.id.toString())(store.getState())
    if (!coin) {
      return
    }

    if (update.type === 'weiInUpdated') {
      const pctGraduated = (100n * BigInt(update.data.weiIn)) / parseEther('1')
      sendWsToast({
        coin,
        beforeSymbol: 'Coin',
        afterSymbol: `Now ${pctGraduated.toString()}% graduated 🚀`,
        onClick,
      })
      return
    }

    if (update.type === 'graduatedCoin') {
      sendWsToast({
        coin,
        beforeSymbol: 'Coin',
        afterSymbol: 'Just graduated 🎓',
        onClick,
      })
      return
    }
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
              this.onUpdate(update)
            }
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }

      this.socket.onclose = (event) => {
        console.log('WebSocket connection closed', event)
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

  private attemptReconnect() {
    if (!this.reconnectOnClose) {
      return
    }

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

  disconnect() {
    if (this.socket) {
      // if we intentionally disconnect, don't try to reconnect
      this.reconnectOnClose = false
      this.socket.close()
      this.socket = null
    }
  }

  // Check if the connection is active
  isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN
  }
}

export default WebSocketService
