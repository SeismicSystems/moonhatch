import React, { useEffect, useState } from 'react'
import { formatUnits } from 'viem'

import { usePumpClient } from '@/hooks/usePumpClient'
import { Coin } from '@/types/coin'

export const TokenBalance: React.FC<{ coin: Coin }> = ({
  coin: { contractAddress, decimals, symbol, graduated, deployedPool },
}) => {
  const { balanceOfWallet } = usePumpClient()
  const [balanceUnits, setBalanceUnits] = useState<bigint | null>(null)
  const [balanceTokens, setBalanceTokens] = useState<string | null>(null)

  useEffect(() => {
    if (!graduated || !deployedPool) {
      return
    }
    balanceOfWallet(contractAddress).then((balance) => {
      setBalanceUnits(balance)
    })
  }, [graduated, deployedPool, contractAddress, balanceOfWallet])

  useEffect(() => {
    console.log('balanceUnits', balanceUnits)
    if (!balanceUnits) {
      setBalanceTokens(null)
      return
    }
    setBalanceTokens(formatUnits(balanceUnits, Number(decimals)).toString())
  }, [balanceUnits, decimals])

  if (!balanceTokens) {
    return <></>
  }

  return (
    <div>
      {balanceTokens} {symbol}
    </div>
  )
}
