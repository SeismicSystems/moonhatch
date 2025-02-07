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

    // Call the composite getter, which returns a tuple: [Coin struct, graduation status]
    return contract.tread
      .getCoinData([coinId])
      .then(([coinData, graduated]: [OnChainCoin, boolean]) => {
        return {
          id: coinId,
          name: coinData.name,
          symbol: coinData.symbol,
          supply: coinData.supply,
          contractAddress: coinData.contractAddress,
          graduated, // include the graduation status
          createdAt: 1738336436, // Update this as needed
          description: '',
        } as Coin
      })
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
