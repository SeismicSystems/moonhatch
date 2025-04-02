import React, { useEffect, useState } from 'react'

import { Balance, useAppState } from '@/hooks/useAppState'
import { usePumpClient } from '@/hooks/usePumpClient'
import { Coin } from '@/types/coin'
import { formatUnitsRounded } from '@/util'

export const TokenBalance: React.FC<{ coin: Coin }> = ({
  coin: { contractAddress, decimals, symbol, graduated, deployedPool },
}) => {
  const { loaded, balanceOfWallet } = usePumpClient()
  const { loadBalance, saveBalance } = useAppState()

  const [balanceObj, setBalanceObj] = useState<Balance<bigint> | null>(null)
  const [balanceUnits, setBalanceUnits] = useState<bigint | null>(null)
  const [balanceTokens, setBalanceTokens] = useState<string | null>(null)

  useEffect(() => {
    setBalanceObj(loadBalance(contractAddress))
  }, [loadBalance, contractAddress])

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
