// src/store/coinSlice.ts
import { BASE_API_URL } from '@/hooks/useFetchCoin'
import type { Coin } from '@/types/coin'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import type { RootState } from '@/store/store'

interface CoinsState {
  coins: Coin[]
  loading: boolean
  error: string | null
}

const initialState: CoinsState = {
  coins: [],
  loading: false,
  error: null,
}

export const fetchCoinsAsync = createAsyncThunk<
  Coin[], // Returned payload type on success
  void, // Parameter type (if none, use void)
  { rejectValue: string } // Type for the reject value
>('coins/fetchCoins', async (_, { rejectWithValue }) => {
  try {
    const response = await fetch(`${BASE_API_URL}/coins`)
    if (!response.ok) {
      throw new Error('Failed to fetch coins')
    }
    const data = (await response.json()) as Coin[]
    return data.map((coin) => ({
      ...coin,
      createdAt: coin.createdAt ? new Date(coin.createdAt + 'Z').getTime() : 0,
      description: coin.description || '',
      twitter: coin.twitter || '',
      website: coin.website || '',
      telegram: coin.telegram || '',
      weiIn: BigInt((coin as any).wei_in || '0'), // cast coin as any to access wei_in
    }))
  } catch (err) {
    return rejectWithValue(err instanceof Error ? err.message : 'Unknown error')
  }
})
export const coinSlice = createSlice({
  name: 'coins',
  initialState,
  reducers: {
    // Action to add or update a single coin (useful for fetching a coin by ID)
    setCoin: (state, action) => {
      const coin: Coin = action.payload
      const index = state.coins.findIndex((c) => c.id === coin.id)
      if (index !== -1) {
        state.coins[index] = coin
      } else {
        state.coins.push(coin)
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCoinsAsync.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCoinsAsync.fulfilled, (state, action) => {
        state.loading = false
        state.coins = action.payload
      })
      .addCase(fetchCoinsAsync.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const selectCoinById = (state: RootState, coinId: bigint) =>
  state.coins.coins.find((coin) => coin.id === coinId)
export const { setCoin } = coinSlice.actions
export default coinSlice.reducer
