import type { Hex } from 'viem'

export type CreateCoinParams = {
  name: string
  symbol: string
  supply: bigint
}

export type OnChainCoin = CreateCoinParams & {
  decimals: bigint | number
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
  id: number
  description: string | null
  createdAt: string // ISO 8601 timestamp
  imageUrl?: string
  graduated: boolean
  weiIn: string
  deployedPool: Hex | null
  hidden: boolean
} & OnChainCoin &
  Omit<CoinFormData, 'image' | 'description' | keyof OnChainCoin>
