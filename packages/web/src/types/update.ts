import { Coin } from '@/types/coin'

export type CoinUpdateType =
  | 'verifiedCoin'
  | 'weiInUpdated'
  | 'graduatedCoin'
  | 'deployedToDex'

type AddCoin = {
  type: 'coin'
  data: Coin
}

type VerifiedCoin = {
  type: 'verifiedCoin'
  data: Coin
}

type WeiInUpdated = {
  type: 'weiInUpdated'
  data: Pick<Coin, 'id' | 'weiIn'>
}

type GraduatedCoin = {
  type: 'graduatedCoin'
  data: Pick<Coin, 'id' | 'graduated'>
}

type DeployedToDex = {
  type: 'deployedToDex'
  data: Pick<Coin, 'id' | 'deployedPool'>
}

export type CoinUpdate =
  | AddCoin
  | VerifiedCoin
  | WeiInUpdated
  | GraduatedCoin
  | DeployedToDex
