import type { Coin } from '@/types/coin'
import type { CoinUpdate } from '@/types/update'
import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

export type CoinsState = {
  entities: Record<string, Coin>
  loading: boolean
  error: string | null
}

const initialState: CoinsState = {
  entities: {},
  loading: false,
  error: null,
}

const coinsSlice = createSlice({
  name: 'coins',
  initialState,
  reducers: {
    fetchCoinsStart(state) {
      state.loading = true
      state.error = null
    },
    fetchCoinsSuccess(state, action: PayloadAction<Coin[]>) {
      state.loading = false

      // Create a map of coins by ID for efficient lookups
      const coinMap: Record<string, Coin> = {}
      action.payload.forEach((coin) => {
        coinMap[coin.id.toString()] = coin
      })

      state.entities = coinMap
    },
    fetchCoinsFailure(state, action: PayloadAction<string>) {
      state.loading = false
      state.error = action.payload
    },
    updateCoin(state, action: PayloadAction<CoinUpdate>) {
      const update = action.payload
      const existingCoin = state.entities[update.data.id.toString()]

      if (existingCoin) {
        // Merge the update with the existing coin
        state.entities[update.data.id.toString()] = {
          ...existingCoin,
          ...update.data,
        }
      } else if (update.type === 'verifiedCoin') {
        state.entities[update.data.id.toString()] = update.data as Coin
      }
    },
  },
})

export const {
  fetchCoinsStart,
  fetchCoinsSuccess,
  fetchCoinsFailure,
  updateCoin,
} = coinsSlice.actions

export const selectAllCoins = (state: { coins: CoinsState }) =>
  Object.values(state.coins.entities)

export const selectCoinById = (state: { coins: CoinsState }, id: string) =>
  state.coins.entities[id]

export const selectCoinsLoading = (state: { coins: CoinsState }) =>
  state.coins.loading

export default coinsSlice.reducer
