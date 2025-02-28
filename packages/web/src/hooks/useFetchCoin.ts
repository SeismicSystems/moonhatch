import { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { TransactionReceipt } from 'viem'

import { BASE_API_URL } from '@/api'
import { fetchCoinById } from '@/api/http'
import { selectAllCoins, updateCoin } from '@/store/slice'
import { AppDispatch } from '@/store/store'
import type { Coin, CoinFormData } from '@/types/coin'

export function useFetchCoin() {
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const dispatch = useDispatch<AppDispatch>()

  // Safely get coins from the store - guarantees an array (even empty)
  const allCoins = useSelector(selectAllCoins)

  // Optionally, mark as loaded on mount
  useEffect(() => {
    setLoaded(true)
  }, [])

  // Simply return the coins we already retrieved
  const loadAllCoins = useCallback(() => {
    return allCoins
  }, [allCoins])

  // Move the coin lookup logic to the component instead
  // This function only handles API fetching
  const fetchCoin = useCallback(
    async (coinId: number): Promise<Coin> => {
      setLoading(true)

      try {
        const coin = await dispatch(fetchCoinById(coinId))
        dispatch(updateCoin({ type: 'coin', data: coin }))
        return coin
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error('Unknown error')
        setError(errorObj)
        throw errorObj
      } finally {
        setLoading(false)
      }
    },
    [dispatch]
  )

  const postCreatedCoin = useCallback(
    ({
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
      return fetch(`${BASE_API_URL}/coins/create`, {
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
    },
    []
  )

  const uploadImage = useCallback(
    async (coinId: number, image: File | null): Promise<string | null> => {
      if (!image) {
        return null
      }
      const body = new FormData()
      body.append('file', image)
      try {
        const response = await fetch(`${BASE_API_URL}/coin/${coinId}/upload`, {
          method: 'POST',
          body,
        })

        if (!response.ok) {
          throw new Error(`Upload failed with status ${response.status}`)
        }

        const publicUrl = await response.text()
        console.log('Uploaded image is available at:', publicUrl)
        return publicUrl
      } catch (error) {
        console.error('Error uploading image:', error)
        return null
      }
    },
    []
  )

  const verifyCoin = useCallback((coinId: number): Promise<Response> => {
    return fetch(`${BASE_API_URL}/coin/${coinId}/verify`, { method: 'POST' })
  }, [])

  return {
    fetchCoin,
    loadAllCoins,
    postCreatedCoin,
    verifyCoin,
    uploadImage,
    allCoins,
    loaded,
    loading,
    error,
  }
}
