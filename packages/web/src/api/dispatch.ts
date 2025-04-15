import { FetchCoinsParams, fetchCoinById, fetchCoins } from '@/api/http'
import { fetchCoinsStart, updateCoin } from '@/store/slice'
import { fetchCoinsFailure, fetchCoinsSuccess } from '@/store/slice'
import { Dispatch } from '@reduxjs/toolkit'

export const fetchCoinByIdAction =
  (coinId: number) => async (dispatch: Dispatch) => {
    try {
      const coin = await fetchCoinById(coinId)
      dispatch(updateCoin({ type: 'coin', data: coin }))
      return coin
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error'
      dispatch(fetchCoinsFailure(errorMessage))
      throw error
    }
  }

export const fetchCoinsAction =
  ({ limit, maxId }: FetchCoinsParams = {}) =>
  async (dispatch: Dispatch) => {
    dispatch(fetchCoinsStart())

    try {
      const data = await fetchCoins({ limit, maxId })
      dispatch(fetchCoinsSuccess(data))
      return data
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error'
      dispatch(fetchCoinsFailure(errorMessage))
      throw error
    }
  }

export const fetchAllCoinsAction =
  (limit: number = 5000, sleepMs: number = 1000) =>
  async (dispatch: Dispatch) => {
    dispatch(fetchCoinsStart())
    const coins = await fetchCoins({ limit })
    let maxId = coins[coins.length - 1].id - 1
    while (maxId > 0) {
      await new Promise((resolve) => setTimeout(resolve, sleepMs))
      const newCoins = await fetchCoins({ limit, maxId })
        .then((newCoins) => {
          dispatch(fetchCoinsSuccess(newCoins))
          return newCoins
        })
        .catch((e) => {
          dispatch(fetchCoinsFailure(e.message))
          throw e
        })
      maxId = newCoins[newCoins.length - 1].id
      coins.push(...newCoins)
      if (newCoins.length < limit) {
        return coins
      }
    }
    return coins
  }
