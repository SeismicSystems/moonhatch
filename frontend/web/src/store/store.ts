// src/store/store.ts
import { configureStore } from '@reduxjs/toolkit'

import coinReducer from './coinSlice'

const store = configureStore({
  reducer: {
    coins: coinReducer,
    // other reducers if needed
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export default store
