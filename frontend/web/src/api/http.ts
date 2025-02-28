import { Dispatch } from 'redux'

import { BASE_API_URL } from '@/api'
import {
  fetchCoinsFailure,
  fetchCoinsStart,
  fetchCoinsSuccess,
} from '@/store/slice'
import { Coin } from '@/types/coin'

export const fetchAllCoins = () => async (dispatch: Dispatch) => {
  dispatch(fetchCoinsStart())

  try {
    const response = await fetch(`${BASE_API_URL}/coins`)

    if (!response.ok) {
      throw new Error('Failed to fetch coins')
    }

    const data: Coin[] = await response.json()
    dispatch(fetchCoinsSuccess(data))
    return data
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'
    dispatch(fetchCoinsFailure(errorMessage))
    throw error
  }
}

export const fetchCoinById = (coinId: number) => async (dispatch: Dispatch) => {
  dispatch(fetchCoinsStart())

  try {
    const response = await fetch(`${BASE_API_URL}/coin/${coinId.toString()}`)
    if (!response.ok) {
      throw new Error(`Response not ok for coin ${coinId}`)
    }
    const data: { coin: Coin } = await response.json()
    dispatch(fetchCoinsSuccess([data.coin]))
    return data.coin
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'
    dispatch(fetchCoinsFailure(errorMessage))
    throw error
  }
}
