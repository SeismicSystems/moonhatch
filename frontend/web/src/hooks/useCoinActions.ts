import { useState } from 'react'
import { parseEther } from 'viem'

import {
  WETH_CONTRACT_ADDRESS,
  useDexContract,
  usePumpContract,
} from '@/hooks/useContract'
import type { Coin } from '@/types/coin'

interface UseCoinActionsParams {
  coin: Coin | null
  walletClient: any
  publicClient: any
  pumpContract: any
  dexContract: any
  buyAmount: string
  setBuyAmount: React.Dispatch<React.SetStateAction<string>>
  setBuyError: React.Dispatch<React.SetStateAction<string | null>>
  setWeiIn: React.Dispatch<React.SetStateAction<bigint | null>>
}

interface UseCoinActionsReturn {
  viewEthIn: () => Promise<void>
  refreshWeiIn: () => Promise<void>
  handleBuy: () => Promise<void>
  loadingEthIn: boolean
}

export const useCoinActions = ({
  coin,
  walletClient,
  publicClient,
  pumpContract,
  dexContract,
  buyAmount,
  setBuyAmount,
  setBuyError,
  setWeiIn,
}: UseCoinActionsParams): UseCoinActionsReturn => {
  const [loadingEthIn, setLoadingEthIn] = useState<boolean>(false)
  const [isBuying, setIsBuying] = useState<boolean>(false)
  const LOCAL_STORAGE_KEY_PREFIX = 'weiIn_coin_'

  const viewEthIn = async (): Promise<void> => {
    if (!walletClient || !pumpContract || !coin || loadingEthIn) return

    setLoadingEthIn(true)
    try {
      const localStorageKey = `${LOCAL_STORAGE_KEY_PREFIX}${coin.id}`
      const cachedWei = localStorage.getItem(localStorageKey)

      if (cachedWei) {
        setWeiIn(BigInt(cachedWei))
      } else {
        const weisBought = (await pumpContract.tread.getWeiIn([
          coin.id,
        ])) as bigint
        localStorage.setItem(localStorageKey, weisBought.toString())
        setWeiIn(weisBought)
      }
    } catch (err) {
      console.error('Error fetching weiIn:', err)
      setWeiIn(null)
    } finally {
      setLoadingEthIn(false)
    }
  }

  const refreshWeiIn = async (): Promise<void> => {
    if (!walletClient || !pumpContract || !coin || loadingEthIn) return

    setLoadingEthIn(true)
    try {
      const localStorageKey = `${LOCAL_STORAGE_KEY_PREFIX}${coin.id}`
      const weisBought = (await pumpContract.read.getWeiIn([coin.id])) as bigint
      console.log(weisBought)
      localStorage.setItem(localStorageKey, weisBought.toString())
      setWeiIn(weisBought)
    } catch (err) {
      console.error('Error refreshing weiIn:', err)
    } finally {
      setLoadingEthIn(false)
    }
  }

  const handleBuy = async () => {
    setBuyError(null)

    if (
      !publicClient ||
      !walletClient ||
      !pumpContract ||
      !coin ||
      !buyAmount
    ) {
      setBuyError('Required data is missing.')
      return
    }

    const amountInWei = parseEther(buyAmount, 'wei')
    const maxWei = parseEther('1', 'wei')

    const localStorageKey = `${LOCAL_STORAGE_KEY_PREFIX}${coin.id}`
    const existingWei = localStorage.getItem(localStorageKey)
    const existingWeiBigInt = existingWei ? BigInt(existingWei) : BigInt(0)

    if (!coin.graduated && existingWeiBigInt + amountInWei > maxWei) {
      setBuyError('1 ETH Max purchase allowed pre-graduation.')
      return
    }

    try {
      if (isBuying) {
        setBuyError('Already buying')
        return
      }
      const balance = await publicClient.getBalance({
        address: walletClient.account.address,
      })

      if (amountInWei > BigInt(balance)) {
        setBuyError('Insufficient balance.')
        return
      }

      setIsBuying(true)
      let txHash

      if (!coin.graduated) {
        txHash = await pumpContract.twrite.buy([coin.id], {
          gas: 1_000_000,
          value: amountInWei,
        })
        console.log('✅ Transaction sent via pumpContract! Hash:', txHash)
      } else {
        if (!dexContract) {
          setBuyError('DEX contract not initialized')
          return
        }
        //temporary deadline to be changed
        const deadline = Math.floor(Date.now() / 1000) + 60 * 20

        const path = [WETH_CONTRACT_ADDRESS, coin.contractAddress]

        txHash = await dexContract.write.swapExactETHForTokens(
          [0, path, walletClient.account.address, deadline],
          { gas: 1_000_000, value: amountInWei }
        )
        console.log('✅ Dex transaction sent! Hash:', txHash)
      }

      // Update local storage with the new total wei bought
      const newTotalWei = existingWeiBigInt + amountInWei
      localStorage.setItem(localStorageKey, newTotalWei.toString())
      setWeiIn(newTotalWei)
      setBuyAmount('')
    } catch (err) {
      console.error('❌ Transaction Failed:', err)
      setBuyError(
        `Transaction failed: ${
          err instanceof Error ? err.message : 'Unknown error'
        }`
      )
    } finally {
      setIsBuying(false)
    }
  }
  return { viewEthIn, refreshWeiIn, handleBuy, loadingEthIn }
}
