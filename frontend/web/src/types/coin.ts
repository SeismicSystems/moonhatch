import type { Hex } from 'viem'

export type OnChainCoin = {
  name: string
  symbol: string
  supply: bigint
  contractAddress: Hex
}

export type CoinFormData = {
  name: string
  symbol: string
  description: string
  image: File | null
  telegram?: string
  website?: string
  twitter?: string
}

export type Coin = {
  id: number
  createdAt: number
  imageUrl?: string
} & OnChainCoin &
  Omit<CoinFormData, 'image' | keyof OnChainCoin>
