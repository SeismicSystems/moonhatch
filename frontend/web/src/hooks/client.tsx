import { useEffect, useState } from 'react'
import { Hex } from 'viem'

import type { Coin } from '../types/coin'
import { usePumpContract } from './contract'

export function useCoins() {
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const { contract, error: contractError } = usePumpContract()

  const fetchCoins = async (): Promise<Coin[]> => {
    if (!contract) {
      if (contractError) {
        console.error(`Error loading contract: ${contractError}`)
      } else {
        console.warn(`Contract not yet loaded`)
      }
      return []
    }

    const maxCoinId = await contract.tread.coinsCreated()
    if (maxCoinId === 0n) {
      console.warn('No coins created yet')
      return []
    }

    // Create an array of promises for fetching each coin
    const fetchPromises = Array.from(
      { length: Number(maxCoinId) },
      (_, index) =>
        contract.tread
          .getCoin([BigInt(index)])
          // @ts-expect-error: This is the actual type returned from call
          .then(({ name, symbol, supply, contractAddress }: OnChainCoin) => {
            return {
              id: index,
              name,
              symbol,
              supply,
              contractAddress,
              // TODO: fetch rest from server
              createdAt: 1738336436,
              description: '',
            } as Coin
          })
    )

    return Promise.all(fetchPromises)
  }

  useEffect(() => {
    if (!contract) {
      return
    }
    setLoaded(true)
  }, [contract])

  const getCoins = async (): Promise<Coin[]> => {
    setLoading(true)
    setError(null)

    try {
      const coins = await fetchCoins()
      return coins
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error occurred'))
      return []
    } finally {
      setLoading(false)
    }
  }

  return {
    getCoins,
    loaded,
    loading,
    error,
  }
}

type CreateCoinParams = {
  name: string
  symbol: string
  supply: bigint
}

export function useCreateCoin() {
  const [error, setError] = useState<string | null>(null)
  const { contract, error: contractError } = usePumpContract()

  const createCoin = async ({
    name,
    symbol,
    supply,
  }: CreateCoinParams): Promise<Hex | undefined> => {
    if (!contract) {
      setError(`Contract not loaded: ${contractError}`)
      return undefined
    }
    return contract.write.createCoin([name, symbol, supply], {
      gas: 1_000_000,
    })
  }

  return { error, createCoin }
}
