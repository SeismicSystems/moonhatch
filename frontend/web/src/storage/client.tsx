import { useState } from 'react'
import { useShieldedContract, useShieldedWallet } from 'seismic-react'
import { Hex } from 'viem'

import { abi } from '../contract/pumpRand.json'
import type { Coin } from '../types/coin'

const CONTRACT_ADDRESS = '0x5fbdb2315678afecb367f032d93f642f64180aa3'

const mockCoins: Coin[] = [
  {
    id: 1,
    createdAt: 1738336434,
    name: 'Bitcoin',
    symbol: 'BTC',
    supply: 21_000_000_000_000_000_000_000n,
    contractAddress: '0x0',
    description: 'The original cryptocurrency',
    imageUrl:
      'https://seismic-public-assets.s3.us-east-1.amazonaws.com/seismic-logo-light.png',
  },
  {
    id: 2,
    createdAt: 1738336435,
    name: 'Ethereum',
    symbol: 'ETH',
    supply: 21_000_000_000_000_000_000_000n,
    contractAddress: '0x1',
    description: 'Programmable blockchain platform',
    imageUrl:
      'https://seismic-public-assets.s3.us-east-1.amazonaws.com/seismic-logo-light.png',
    website: 'https://ethereum.org',
    telegram: 'https://t.me/ethereum',
    twitter: 'https://twitter.com/ethereum',
  },
  {
    id: 3,
    createdAt: 1738336436,
    name: 'Dogecoin',
    symbol: 'DOGE',
    supply: 21_000_000_000_000_000_000_000n,
    contractAddress: '0x2',
    description: 'Much wow, very crypto',
    website: 'https://dogecoin.com',
    twitter: 'https://twitter.com/dogecoin',
  },
]

export function useCoins() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const { publicClient } = useShieldedWallet()

  const fetchCoins = async (): Promise<Coin[]> => {
    if (!publicClient) {
      return []
    }

    const maxCoinId = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi,
      functionName: 'coinsCreated',
      args: [],
    })
    if (maxCoinId === 0n) {
      console.log('No coins created yet')
      return []
    }

    // Create an array of promises for fetching each coin
    const fetchPromises = Array.from(
      { length: Number(maxCoinId) },
      (_, index) =>
        publicClient
          .readContract({
            address: CONTRACT_ADDRESS,
            abi,
            functionName: 'getCoin',
            args: [BigInt(index)],
          })
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

  const getCoins = async (): Promise<Coin[]> => {
    setLoading(true)
    setError(null)

    try {
      const coins = await fetchCoins()
      // TODO: make real call to chain
      return [...mockCoins, ...coins]
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error occurred'))
      return []
    } finally {
      setLoading(false)
    }
  }

  return {
    getCoins,
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
  const { contract, error: contractError } = useShieldedContract({
    abi,
    address: CONTRACT_ADDRESS,
  })

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
