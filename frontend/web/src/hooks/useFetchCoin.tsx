import { useEffect, useState } from 'react'

import { useContract } from '@/hooks/useContract'
import type { Coin, OnChainCoin } from '@/types/coin'

export function useFetchCoin() {
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const { contract, error: contractError } = useContract()

  // const fetchCoin = async (coinId: bigint): Promise<Coin> => {
  //   if (!contract) {
  //     if (contractError) {
  //       throw new Error(`Error loading contract: ${contractError}`)
  //     } else {
  //       throw new Error(`Contract not yet loaded`)
  //     }
  //   }
  //   return (
  //     contract.tread
  //       .getCoin([coinId])
  //       // @ts-expect-error: This is the actual type returned from call
  //       .then(({ name, symbol, supply, contractAddress }: OnChainCoin) => {
  //         return {
  //           id: coinId,
  //           name,
  //           symbol,
  //           supply,
  //           contractAddress,
  //           // TODO: fetch rest from server
  //           createdAt: 1738336436,
  //           description: '',
  //         } as Coin
  //       })
  //   )
  // }

  const fetchCoin = async (coinId: bigint): Promise<Coin> => {
    if (!contract) {
      if (contractError) {
        throw new Error(`Error loading contract: ${contractError}`)
      } else {
        throw new Error(`Contract not yet loaded`)
      }
    }

    // Fetch on-chain data
    const [coinData, graduated] = (await contract.tread.getCoinData([
      coinId,
    ])) as [OnChainCoin, boolean]

    // Initialize description and other variables to empty strings
    let description = ''
    let twitter = ''
    let telegram = ''
    let website = ''

    // Attempt to fetch additional info from the database using the correct endpoint
    try {
      const response = await fetch(
        `http://127.0.0.1:3000/coin/${coinId.toString()}`
      )
      if (response.ok) {
        const dbData = await response.json()
        twitter = dbData.coin?.twitter || ''
        telegram = dbData.coin?.telegram || ''
        website = dbData.coin?.website || ''
        // Adjust based on your API response structure:
        // Your API returns { "coin": { ... } }
        description = dbData.coin?.description || ''
      } else {
        console.warn(`No DB info for coin ${coinId}, response not ok`)
      }
    } catch (dbError) {
      console.error(`Failed to fetch DB info for coin ${coinId}:`, dbError)
      // Fallback: leave description empty or assign a default value
    }

    return {
      id: coinId,
      name: coinData.name,
      symbol: coinData.symbol,
      supply: coinData.supply,
      contractAddress: coinData.contractAddress,
      graduated,
      createdAt: 1738336436, // update as needed
      twitter,
      telegram,
      website,
      description,
      creator: coinData.creator,
    } as Coin
  }

  const fetchCoinsCreated = async (): Promise<bigint> => {
    if (!contract) {
      if (contractError) {
        throw new Error(`Error loading contract: ${contractError}`)
      } else {
        throw new Error(`Contract not yet loaded`)
      }
    }
    // @ts-expect-error: this returns a bigint
    const maxCoinId: bigint = await contract.tread.coinsCreated()
    return maxCoinId
  }

  const fetchAllCoins = async (): Promise<Coin[]> => {
    if (!contract) {
      if (contractError) {
        console.error(`Error loading contract: ${contractError}`)
      } else {
        console.warn(`Contract not yet loaded`)
      }
      return []
    }

    const maxCoinId = await fetchCoinsCreated()
    if (maxCoinId === 0n) {
      console.warn('No coins created yet')
      return []
    }

    // Create an array of promises for fetching each coin
    const fetchPromises = Array.from(
      { length: Number(maxCoinId) },
      (_, index) => fetchCoin(BigInt(index))
    )

    return Promise.all(fetchPromises)
  }

  useEffect(() => {
    if (!contract) {
      return
    }
    setLoaded(true)
  }, [contract])

  const fetchCoins = async (): Promise<Coin[]> => {
    setLoading(true)
    setError(null)

    try {
      const coins = await fetchAllCoins()
      return coins
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error occurred'))
      return []
    } finally {
      setLoading(false)
    }
  }

  return {
    fetchCoinsCreated,
    fetchCoin,
    fetchCoins,
    loaded,
    loading,
    error,
  }
}
