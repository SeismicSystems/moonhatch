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

      const coinId = update.data.id.toString()
      if (existingCoin) {
        // Merge the update with the existing coin
        state.entities[coinId] = {
          ...existingCoin,
          ...update.data,
        }
      } else if (update.type === 'verifiedCoin') {
        state.entities[coinId] = update.data as Coin
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

// Base selector for coins state
export const selectCoinsState = (state: RootState) => state.coins

// Selector for loading state
export const selectCoinsLoading = createSelector(
  [selectCoinsState],
  (coinsState) => coinsState.loading
)

// Selector for the entities dictionary
export const selectCoinsEntities = createSelector(
  [selectCoinsState],
  (coinsState) => coinsState.entities || {}
)

// Individual entity selectors with field-specific dependencies
export const selectCoinById = (coinId: string) =>
  createSelector([selectCoinsEntities], (entities) => entities[coinId])

// Field-specific selectors that only change when that field changes
export const selectCoinGraduatedStatus = (coinId: string) =>
  createSelector([selectCoinById(coinId)], (coin) => coin?.graduated)

export const selectCoinWeiInStatus = (coinId: string) =>
  createSelector([selectCoinById(coinId)], (coin) => coin?.weiIn)

export const selectCoinDeployedPoolStatus = (coinId: string) =>
  createSelector([selectCoinById(coinId)], (coin) => coin?.deployedPool)

// Main selector that returns entities but with identity based on tracked fields
export const selectAllCoins = createSelector(
  [
    selectCoinsEntities,
    (state) => {
      const entities = selectCoinsEntities(state)
      // This creates a dependency on the specific fields we care about
      return Object.keys(entities).reduce(
        (acc, id) => {
          acc[id] = {
            graduated: entities[id].graduated,
            weiIn: entities[id].weiIn,
            deployedPool: entities[id].deployedPool,
          }
          return acc
        },
        {} as Record<string, Pick<Coin, 'graduated' | 'weiIn' | 'deployedPool'>>
      )
    },
  ],
  // Return the full entities dictionary, but only when tracked fields change
  (entities) => entities
)

export default coinsSlice.reducer
