import React, { useCallback, useEffect, useState } from 'react'

import { Balance, useAppState } from '@/hooks/useAppState'
import { usePumpClient } from '@/hooks/usePumpClient'
import { Coin } from '@/types/coin'
import { formatUnitsRounded } from '@/util'

const REFRESH_EVERY_MS = 5 * 60 * 1000

export const TokenBalance: React.FC<{ coin: Coin }> = ({
  coin: { contractAddress, decimals, symbol, graduated, deployedPool },
}) => {
  const { loaded, balanceOfWallet } = usePumpClient()
  const { loadBalance, saveBalance } = useAppState()

  const [fetching, setFetching] = useState(false)
  const [balance, setBalance] = useState<Balance<bigint> | null>(null)
  const [balanceTokens, setBalanceTokens] = useState<string | null>(null)

  const fetchBalance = useCallback(() => {
    if (fetching) {
      return
    }
    setFetching(true)
    balanceOfWallet(contractAddress)
      .then((units) => {
        saveBalance(contractAddress, units)
      })
      .finally(() => {
        setFetching(false)
      })
  }, [balanceOfWallet, contractAddress, saveBalance, fetching])

  useEffect(() => {
    setBalance(loadBalance(contractAddress))
  }, [loadBalance, contractAddress])

  useEffect(() => {
    if (!loaded || !graduated || !deployedPool) {
      return
    }

    if (balance) {
      const lastUpdated = balance.lastUpdated
      const now = Date.now()
      const diff = now - lastUpdated
      if (diff < REFRESH_EVERY_MS) {
        return
      }
    }
    fetchBalance()
  }, [loaded, graduated, deployedPool, balance, fetchBalance])

  useEffect(() => {
    if (!balance) {
      setBalanceTokens(null)
      return
    }
    const balanceTokens = formatUnitsRounded(
      balance.balanceUnits,
      Number(decimals)
    )
    setBalanceTokens(balanceTokens)
  }, [balance, decimals])

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
