import { useState } from 'react'
import { useShieldedContract, useShieldedWallet } from 'seismic-react'
import { Hex } from 'viem'

import { abi } from '../contract/pumpRand.json'
import { CoinFormData } from '../create/coin-form'

export type Coin = { id: number; createdAt: number; imageUrl?: string } & Omit<
  CoinFormData,
  'image'
>

const CONTRACT_ADDRESS = '0x5fbdb2315678afecb367f032d93f642f64180aa3'

const mockCoins: Coin[] = [
  {
    id: 1,
    createdAt: 1738336434,
    name: 'Bitcoin',
    ticker: 'BTC',
    description: 'The original cryptocurrency',
    imageUrl:
      'https://seismic-public-assets.s3.us-east-1.amazonaws.com/seismic-logo-light.png',
  },
  {
    id: 2,
    createdAt: 1738336435,
    name: 'Ethereum',
    ticker: 'ETH',
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
    ticker: 'DOGE',
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
    console.log(`Max coin iD = ${maxCoinId}`)
    return []
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
