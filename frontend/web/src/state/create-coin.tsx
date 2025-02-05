import { useState } from 'react'
import { Hex } from 'viem'

import { usePumpContract } from './contract'

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
