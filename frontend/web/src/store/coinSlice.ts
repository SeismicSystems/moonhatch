// src/store/coinSlice.ts
import { fetchCoinAPI, fetchCoinsAPI } from '@/api/coinAPI'
import type { Coin } from '@/types/coin'
import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit'

export const fetchCoins = createAsyncThunk(
  'coins/fetchCoins',
  async (_, { rejectWithValue }) => {
    try {
      return await fetchCoinsAPI()
    } catch (err: any) {
      return rejectWithValue(err.message)
    }
  }
)

export const fetchCoin = createAsyncThunk(
  'coins/fetchCoin',
  async (coinId: bigint, { rejectWithValue }) => {
    try {
      return await fetchCoinAPI(coinId)
    } catch (err: any) {
      return rejectWithValue(err.message)
    }
  }
)

interface CoinState {
  coins: Coin[]
  selectedCoin: Coin | null
  loading: boolean
  error: string | null
}

const initialState: CoinState = {
  coins: [],
  selectedCoin: null,
  loading: false,
  error: null,
}

const coinSlice = createSlice({
  name: 'coins',
  initialState,
  reducers: {
    setSelectedCoin(state, action: PayloadAction<Coin | null>) {
      state.selectedCoin = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCoins.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCoins.fulfilled, (state, action: PayloadAction<Coin[]>) => {
        state.loading = false
        state.coins = action.payload
      })
      .addCase(fetchCoins.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { setSelectedCoin } = coinSlice.actions
export default coinSlice.reducer
