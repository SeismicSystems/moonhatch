import { useEffect, useState } from 'react'
import { TransactionReceipt } from 'viem'

import type { Coin, CoinFormData } from '@/types/coin'

interface APIEndpoints {
  coinDetail: string
  allCoins: string
}

export const BASE_API_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:3000'

export function useFetchCoin() {
  const endpoints: APIEndpoints = {
    coinDetail: `${BASE_API_URL}/coin`,
    allCoins: `${BASE_API_URL}/coins`,
  }
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
          createdAt: coin.createdAt
            ? new Date(coin.createdAt + 'Z').getTime()
            : 0,
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

  const postCreatedCoin = ({
    coinId,
    formData,
    imageUrl,
    receipt,
  }: {
    coinId: number
    formData: CoinFormData
    imageUrl: string | null
    receipt: TransactionReceipt
  }) => {
    return fetch(`${BASE_API_URL}/coin/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: coinId,
        name: formData.name,
        symbol: formData.symbol,
        supply: '21000000000000000000000', // as a string for BigDecimal
        decimals: 18,
        contractAddress: receipt.to,
        creator: receipt.from,
        graduated: false,
        verified: false,
        description: formData.description || null,
        imageUrl,
        twitter: formData.twitter || null,
        website: formData.website || null,
        telegram: formData.telegram || null,
      }),
    })
  }

  const uploadImage = async (
    coinId: number,
    image: File | null
  ): Promise<string | null> => {
    if (!image) {
      return null
    }
    const body = new FormData()
    body.append('file', image)
    // Send a POST request to the backend
    return fetch(`${BASE_API_URL}/coin/${coinId}/upload`, {
      method: 'POST',
      body,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Upload failed with status ${response.status}`)
        }
        // Assuming the backend returns the URL as plain text.
        return response.text()
      })
      .then((publicUrl) => {
        console.log('Uploaded image is available at:', publicUrl)
        return publicUrl
      })
      .catch((error) => {
        console.error('Error uploading image:', error)
        return null
      })
  }

  const verifyCoin = (coinId: number): Promise<Response> => {
    return fetch(`${BASE_API_URL}/coin/${coinId}/verify`, { method: 'POST' })
  }

  return {
    fetchCoin,
    fetchCoins,
    postCreatedCoin,
    verifyCoin,
    uploadImage,
    loaded,
    loading,
    error,
  }
}
