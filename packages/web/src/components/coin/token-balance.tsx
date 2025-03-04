import React, { useEffect, useState } from 'react'

import { usePumpClient } from '@/hooks/usePumpClient'
import { Coin } from '@/types/coin'
import { formatUnitsRounded } from '@/util'

export const TokenBalance: React.FC<{ coin: Coin }> = ({
  coin: { contractAddress, decimals, symbol, graduated, deployedPool },
}) => {
  const { loaded, balanceOfWallet } = usePumpClient()
  const [balanceUnits, setBalanceUnits] = useState<bigint | null>(null)
  const [balanceTokens, setBalanceTokens] = useState<string | null>(null)

  useEffect(() => {
    if (!loaded || !graduated || !deployedPool) {
      return
    }
    balanceOfWallet(contractAddress).then((balance) => {
      setBalanceUnits(balance)
    })
  }, [loaded, graduated, deployedPool, contractAddress, balanceOfWallet])

  useEffect(() => {
    if (!balanceUnits) {
      setBalanceTokens(null)
      return
    }
    setBalanceTokens(formatUnitsRounded(balanceUnits, Number(decimals)))
  }, [balanceUnits, decimals])

  if (!balanceTokens) {
    return <></>
  }

  return (
    <div>
      <span className="text-orange-200">{balanceTokens}</span>{' '}
      <span className="text-orange-300 font-bold">{symbol}</span>
    </div>
  )
}
