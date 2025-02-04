import { useState } from 'react'

import { CoinFormData } from '../create/coin-form'

export type Coin = { id: number; createdAt: number; imageUrl?: string } & Omit<
  CoinFormData,
  'image'
>

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

  const getCoins = async (): Promise<Coin[]> => {
    setLoading(true)
    setError(null)

    try {
      // TODO: make real call to chain
      return mockCoins
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
