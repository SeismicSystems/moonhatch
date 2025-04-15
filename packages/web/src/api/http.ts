import { sleep } from 'bun'
import { Dispatch } from 'redux'

import { BASE_API_URL } from '@/api'
import {
  fetchCoinsFailure,
  fetchCoinsStart,
  fetchCoinsSuccess,
} from '@/store/slice'
import { Coin } from '@/types/coin'

type FetchCoinsParams = {
  limit?: number
  maxId?: number
}

export const fetchCoins =
  ({ limit, maxId }: FetchCoinsParams = {}) =>
  async (dispatch: Dispatch) => {
    dispatch(fetchCoinsStart())

    const params = new URLSearchParams()
    if (limit) {
      params.set('limit', limit.toString())
    }
    if (maxId) {
      params.set('maxId', maxId.toString())
    }
    const queryString = params.toString()
    const url = `${BASE_API_URL}/coins${queryString ? `?${queryString}` : ''}`

    try {
      const response = await fetch(url)
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

export const fetchAllCoins =
  (limit: number = 5000, sleepMs: number = 1000) =>
  async (dispatch: Dispatch) => {
    const coins = await fetchCoins({ limit })(dispatch)
    let maxId = coins[coins.length - 1].id - 1
    while (maxId > 0) {
      await sleep(sleepMs)
      const newCoins = await fetchCoins({ limit, maxId })(dispatch)
      maxId = newCoins[newCoins.length - 1].id
      coins.push(...newCoins)
      if (newCoins.length < limit) {
        return coins
      }
    }
    return coins
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
