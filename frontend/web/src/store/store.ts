import { websocketService } from '@/api/websocket'
import coinsReducer from '@/store/slice'
import { configureStore } from '@reduxjs/toolkit'

export const store = configureStore({
  reducer: {
    coins: coinsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore non-serializable values in the WebSocket service
        ignoredActions: ['socket/connect', 'socket/disconnect'],
      },
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

// Initialize WebSocket service with store dispatch
websocketService.init(store.dispatch)
