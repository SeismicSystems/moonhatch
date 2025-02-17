import { useEffect, useState } from 'react'

import type { Coin } from '@/types/coin'

interface APIEndpoints {
  coinDetail: string
  allCoins: string
}

export function useFetchCoin(
  endpoints: APIEndpoints = {
    coinDetail: 'http://127.0.0.1:3000/coin',
    allCoins: 'http://127.0.0.1:3000/coins',
  }
) {
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchCoin = async (coinId: bigint): Promise<Coin> => {
    setLoading(true)
    try {
      // Use the coinDetail endpoint for a single coin
      const response = await fetch(
        `${endpoints.coinDetail}/${coinId.toString()}`
      )
      if (response.ok) {
        const data = await response.json()
        return data.coin as Coin
      } else {
        throw new Error(`Response not ok for coin ${coinId}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
      throw err
    } finally {
      setLoading(false)
      setLoaded(true)
    }
  }

  const fetchCoins = async (): Promise<Coin[]> => {
    setLoading(true)
    try {
      // Fetch from the allCoins endpoint
      const response = await fetch(endpoints.allCoins)
      if (response.ok) {
        const data = (await response.json()) as Coin[]
        // Map over the array to provide default values for nullable fields
        return data.map((coin) => ({
          ...coin,
          created_at: coin.created_at || '', // use coin.created_at here
          description: coin.description || '',
          twitter: coin.twitter || '',
          website: coin.website || '',
          telegram: coin.telegram || '',
        }))
      } else {
        throw new Error(`Failed to fetch coins`)
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
      throw err
    } finally {
      setLoading(false)
      setLoaded(true)
    }
  }

  // Optionally, mark as loaded on mount
  useEffect(() => {
    setLoaded(true)
  }, [])

  return {
    fetchCoin,
    fetchCoins,
    loaded,
    loading,
    error,
  }
}
