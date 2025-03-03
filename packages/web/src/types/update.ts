import { Coin } from '@/types/coin'

export type CoinUpdateType =
  | 'coin'
  | 'verifiedCoin'
  | 'weiInUpdated'
  | 'graduatedCoin'
  | 'deployedToDex'

export type CoinUpdate = {
  type: CoinUpdateType
  data: Partial<Coin> & { id: number }
}
