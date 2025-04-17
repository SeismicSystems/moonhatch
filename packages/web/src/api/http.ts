import { BASE_API_URL } from '@/api'
import { Coin } from '@/types/coin'

export type FetchCoinsParams = {
  limit?: number
  maxId?: number
  startDispatch?: boolean
}

export const fetchCoins = async ({
  limit,
  maxId,
}: FetchCoinsParams = {}): Promise<Coin[]> => {
  const params = new URLSearchParams()
  if (limit) {
    params.set('limit', limit.toString())
  }
  if (maxId) {
    params.set('maxId', maxId.toString())
  }
  const queryString = params.toString()
  const url = `${BASE_API_URL}/coins${queryString ? `?${queryString}` : ''}`

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Failed to fetch coins')
  }

  return await response.json()
}

export const fetchCoinById = async (coinId: number): Promise<Coin> => {
  const response = await fetch(`${BASE_API_URL}/coin/${coinId.toString()}`)
  if (!response.ok) {
    throw new Error(`Response not ok for coin ${coinId}`)
  }
  const data: { coin: Coin } = await response.json()
  return data.coin
}

export const fetchCoinByAddress = async (
  address: string
): Promise<Coin | null> => {
  try {
    const response = await fetch(`${BASE_API_URL}/address/${address}`)
    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error(`Response not ok for address ${address}`)
    }
    const data: { coin: Coin } = await response.json()
    return data.coin
  } catch (error) {
    console.error(`Error fetching coin by address: ${error}`)
    return null
  }
}
