// src/store/index.ts
import coinReducer from '@/store/slices/coinSlice'
import { configureStore } from '@reduxjs/toolkit'

export const store = configureStore({
  reducer: {
    coins: coinReducer,
  },
})

// Infer the `RootState` and `AppDispatch` types from the store itself.
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
