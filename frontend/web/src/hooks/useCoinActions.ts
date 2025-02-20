import { useState } from 'react'
import { parseEther } from 'viem'

import { WETH_CONTRACT_ADDRESS } from '@/hooks/useContract'
import type { Coin } from '@/types/coin'

interface UseCoinActionsParams {
  coin: Coin | null
  walletClient: any
  publicClient: any
  pumpContract: any
  coinContract: any
  dexContract: any
  buyAmount: string
  setBuyAmount: React.Dispatch<React.SetStateAction<string>>
  setBuyError: React.Dispatch<React.SetStateAction<string | null>>
  setWeiIn: React.Dispatch<React.SetStateAction<bigint | null>>
  sellAmount: string
  setSellAmount: React.Dispatch<React.SetStateAction<string>>
  setSellError: React.Dispatch<React.SetStateAction<string | null>>
}

interface UseCoinActionsReturn {
  viewEthIn: () => Promise<void>
  refreshWeiInForGraduated: () => Promise<void>
  refreshWeiInForNonGraduated: () => Promise<void>
  handleBuy: () => Promise<void>
  handleSell: () => Promise<void>
  loadingEthIn: boolean
}

export const useCoinActions = ({
  coin,
  walletClient,
  publicClient,
  pumpContract,
  coinContract,
  dexContract,
  buyAmount,
  setBuyAmount,
  setBuyError,
  setWeiIn,
  sellAmount,
  setSellAmount,
  setSellError,
}: UseCoinActionsParams): UseCoinActionsReturn => {
  const [loadingEthIn, setLoadingEthIn] = useState<boolean>(false)
  const [isBuying, setIsBuying] = useState<boolean>(false)
  const [isSelling, setIsSelling] = useState<boolean>(false)
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
        // Example: using pumpContract.read.getWeiIn if no cached value exists
        const weisBought = (await pumpContract.read.getWeiIn([
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

  const refreshWeiInForGraduated = async (): Promise<void> => {
    console.log('refreshWeiInForGraduated')
    if (!walletClient || !pumpContract || !coin || loadingEthIn) return

    setLoadingEthIn(true)
    try {
      // For graduated coins, we read the on-chain balance using coinContract
      if (coin.graduated) {
        const userAddress = walletClient.account.address
        const weiOnChain = (await coinContract.tread.balanceOf([
          userAddress,
        ])) as bigint
        console.log('Graduated balance:', weiOnChain)
        setWeiIn(weiOnChain)
      } else {
        // Fallback if coin isn't graduated (should not normally hit this branch)
        const localStorageKey = `${LOCAL_STORAGE_KEY_PREFIX}${coin.id}`
        const weisBought = (await pumpContract.read.getWeiIn([
          coin.id,
        ])) as bigint
        localStorage.setItem(localStorageKey, weisBought.toString())
        setWeiIn(weisBought)
      }
    } catch (err) {
      console.error('Error refreshing weiIn for graduated:', err)
    } finally {
      setLoadingEthIn(false)
    }
  }

  const refreshWeiInForNonGraduated = async (): Promise<void> => {
    console.log('refreshWeiInForNonGraduated')
    if (!walletClient || !pumpContract || !coin || loadingEthIn) return

    setLoadingEthIn(true)
    try {
      // For non-graduated coins, we update from pumpContract
      if (!coin.graduated) {
        const localStorageKey = `${LOCAL_STORAGE_KEY_PREFIX}${coin.id}`
        const weisBought = (await pumpContract.read.getWeiIn([
          coin.id,
        ])) as bigint
        localStorage.setItem(localStorageKey, weisBought.toString())
        setWeiIn(weisBought)
      } else {
        // Fallback if coin is graduated (should not normally hit this branch)
        const userAddress = walletClient.account.address
        const weiOnChain = (await coinContract.tread.balanceOf([
          userAddress,
        ])) as bigint
        console.log('Graduated balance fallback:', weiOnChain)
        setWeiIn(weiOnChain)
      }
    } catch (err) {
      console.error('Error refreshing weiIn for non-graduated:', err)
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
        const deadline = Math.floor(Date.now() / 1000) + 60 * 20
        const path = [WETH_CONTRACT_ADDRESS, coin.contractAddress]
        txHash = await dexContract.write.swapExactETHForTokens(
          [0, path, walletClient.account.address, deadline],
          { gas: 1_000_000, value: amountInWei }
        )
        console.log('✅ Dex transaction sent! Hash:', txHash)
      }
      const newTotalWei = existingWeiBigInt + amountInWei
      localStorage.setItem(localStorageKey, newTotalWei.toString())
      setWeiIn(newTotalWei)
      setBuyAmount('')
    } catch (err) {
      console.error('❌ Transaction Failed:', err)
      setBuyError(
        `Transaction failed: ${err instanceof Error ? err.message : 'Unknown error'}`
      )
    } finally {
      setIsBuying(false)
    }
  }

  const handleSell = async () => {
    setSellError(null)
    if (
      !publicClient ||
      !walletClient ||
      !pumpContract ||
      !coin ||
      !sellAmount
    ) {
      setSellError('Required data is missing.')
      return
    }
    const sellAmountWei = parseEther(sellAmount, 'wei')
    try {
      const userAddress = walletClient.account.address
      const tokenBalance = (await pumpContract.tread.balanceOf([
        userAddress,
      ])) as bigint
      if (sellAmountWei > tokenBalance) {
        setSellError('Insufficient token balance for selling.')
        return
      }
      const spender = dexContract?.read?.address || dexContract?.address
      if (!spender) {
        setSellError('DEX contract not initialized')
        return
      }
      const currentAllowance = (await pumpContract.read.allowance([
        userAddress,
        spender,
      ])) as bigint
      if (sellAmountWei > currentAllowance) {
        console.log(
          'Current allowance insufficient. Sending approve transaction...'
        )
        const approveTx = await pumpContract.write.approve(
          [spender, sellAmountWei],
          {
            gas: 1_000_000,
          }
        )
        await approveTx.wait()
        console.log('Approval confirmed.')
      } else {
        console.log('Sufficient allowance available.')
      }

      let txHash
      setIsSelling(true)
      if (!coin.graduated) {
        console.log('Sell logic for non-graduated tokens is not implemented.')
      } else {
        const deadline = Math.floor(Date.now() / 1000) + 60 * 20
        const path = [coin.contractAddress, WETH_CONTRACT_ADDRESS]
        txHash = await dexContract.write.swapExactTokensForETH(
          [sellAmountWei, 0, path, userAddress, deadline],
          { gas: 1_000_000 }
        )
        console.log('✅ Sell transaction sent via DEX! Hash:', txHash)
      }
      setSellAmount('')
    } catch (err) {
      console.error('Sell transaction failed:', err)
      setSellError(
        `Transaction failed: ${err instanceof Error ? err.message : 'Unknown error'}`
      )
    } finally {
      setIsSelling(false)
    }
  }

  return {
    viewEthIn,
    refreshWeiInForGraduated,
    refreshWeiInForNonGraduated,
    handleBuy,
    handleSell,
    loadingEthIn,
  }
}
