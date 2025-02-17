import type { Hex } from 'viem'

export type CreateCoinParams = {
  name: string
  symbol: string
  supply: bigint
}

export type OnChainCoin = CreateCoinParams & {
  contractAddress: Hex
  graduated: boolean
  creator: Hex
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
  id: bigint
  created_at: number
  imageUrl?: string
  graduated: boolean
} & OnChainCoin &
  Omit<CoinFormData, 'image' | keyof OnChainCoin>
