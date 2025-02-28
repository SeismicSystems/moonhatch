import type { Coin } from '@/types/coin'
import type { CoinUpdate } from '@/types/update'
import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'
import { createSelector } from '@reduxjs/toolkit'

import type { RootState } from './store'

// Adjust path as needed

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
      action.payload.forEach((coin) => {
        state.entities[coin.id.toString()] = {
          ...state.entities[coin.id.toString()],
          ...coin,
        }
      })
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

// Base selector that gets the coins slice
export const selectCoinsState = (state: RootState) => state.coins

// Memoized selector for loading state
export const selectCoinsLoading = createSelector(
  [selectCoinsState],
  (coinsState) => coinsState.loading
)

// Memoized selector that includes all coin data
// But only creates a new reference when graduated, weiIn, or deployedPool fields change
export const selectAllCoins = createSelector(
  [selectCoinsState],
  (coinsState) => {
    // This is the key - by accessing these fields in the selector function,
    // we ensure the selector only returns a new reference when these fields change
    if (coinsState.entities) {
      // For normalized object structure (always an object)
      Object.values(coinsState.entities).forEach((coin) => {
        // Just accessing these fields tells Redux to watch them
        coin.graduated
        coin.weiIn
        coin.deployedPool
      })
    }

    // Return the complete data
    return coinsState.entities || {}
  }
)

// Optional: Create more specific selectors if needed
export const selectCoinById = createSelector(
  [selectAllCoins, (_, coinId: string) => coinId],
  (coins, coinId) => coins[coinId]
)

export default coinsSlice.reducer
