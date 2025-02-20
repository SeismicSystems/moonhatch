// src/api/coinAPI.ts
import type { Coin } from '@/types/coin'

export const BASE_API_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:3000'

export async function fetchCoinAPI(coinId: bigint): Promise<Coin> {
  const response = await fetch(`${BASE_API_URL}/coin/${coinId.toString()}`)
  if (!response.ok) {
    throw new Error(`Response not ok for coin ${coinId}`)
  }
  const data = await response.json()
  return data.coin as Coin
}

export async function fetchCoinsAPI(): Promise<Coin[]> {
  const response = await fetch(`${BASE_API_URL}/coins`)
  if (!response.ok) {
    throw new Error(`Failed to fetch coins`)
  }
  const data = await response.json()
  return data.map((coin: Coin) => ({
    ...coin,
    createdAt: coin.createdAt ? new Date(coin.createdAt + 'Z').getTime() : 0,
    description: coin.description || '',
    twitter: coin.twitter || '',
    website: coin.website || '',
    telegram: coin.telegram || '',
  }))
}
