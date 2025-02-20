import { useState } from 'react'
import { useShieldedWallet } from 'seismic-react'
import {
  ShieldedContract,
  ShieldedPublicClient,
  ShieldedWalletClient,
  getShieldedContract,
} from 'seismic-viem'
import type { Hex, TransactionReceipt } from 'viem'

import type { CreateCoinParams } from '@/types/coin'

import {
  COIN_CONTRACT_ABI,
  WETH_CONTRACT_ADDRESS,
  useDexContract,
  usePumpContract,
} from './useContract'

const DEFAULT_DEADLINE_MS = 20 * 60 * 1000

type TradeParams = {
  token: Hex
  amountIn: bigint
  minAmountOut?: bigint
  deadlineMs?: number
}

type BalanceOfParams = {
  token: Hex
  owner: Hex
}

type AllowanceParams = {
  token: Hex
  spender: Hex
}

type ApproveDexParams = {
  token: Hex
  amount: bigint
}

type ApproveParams = ApproveDexParams & {
  spender: Hex
}

export const usePumpClient = () => {
  const { walletClient, publicClient } = useShieldedWallet()
  const { contract: pumpContract } = usePumpContract()
  const { contract: dexContract } = useDexContract()
  const [error, setError] = useState<string | null>(null)

  const getDeadline = (deadlineMs: number) => {
    return Math.floor((Date.now() + deadlineMs) / 1000)
  }

  const getWeiIn = async (coinId: bigint): Promise<bigint> => {
    if (!pumpContract) {
      setError('Pump contract not found')
      throw new Error('Pump contract not found')
    }
    const weiIn = (await pumpContract.read.getWeiIn([coinId])) as bigint
    return weiIn
  }

  const wallet = (): ShieldedWalletClient => {
    if (!walletClient) {
      setError('Wallet client not found')
      throw new Error('Wallet client not found')
    }
    return walletClient
  }

  const pubClient = (): ShieldedPublicClient => {
    if (!publicClient) {
      setError('Public client not found')
      throw new Error('Public client not found')
    }
    return publicClient
  }

  const dex = (): ShieldedContract => {
    if (!dexContract) {
      setError('DEX contract not found')
      throw new Error('DEX contract not found')
    }
    return dexContract
  }

  const pump = (): ShieldedContract => {
    if (!pumpContract) {
      setError('Pump contract not found')
      throw new Error('Pump contract not found')
    }
    return pumpContract
  }

  const walletAddress = (): Hex => {
    return wallet().account.address
  }

  const createCoin = async ({
    name,
    symbol,
    supply,
  }: CreateCoinParams): Promise<Hex> => {
    return pump().write.createCoin([name, symbol, supply], {
      gas: 1_000_000,
    })
  }

  const getCoinContract = (token: Hex) => {
    return getShieldedContract({
      abi: COIN_CONTRACT_ABI,
      address: token,
      client: wallet(),
    })
  }

  const balanceOfErc20 = async ({
    token,
    owner,
  }: BalanceOfParams): Promise<bigint> => {
    const coinContract = getCoinContract(token)
    const balance = (await coinContract.tread.balanceOf([owner])) as bigint
    return balance
  }

  const balanceOfWallet = async (token: Hex) => {
    const balance = await balanceOfErc20({
      token,
      owner: walletAddress(),
    })
    return balance
  }

  const balanceEthWallet = async (): Promise<bigint> => {
    return await pubClient().getBalance({
      address: walletAddress(),
    })
  }

  const allowance = async ({
    token,
    spender,
  }: AllowanceParams): Promise<bigint> => {
    const coinContract = getCoinContract(token)
    const allowance = (await coinContract.tread.allowance([spender])) as bigint
    return allowance
  }

  const approve = async ({
    token,
    spender,
    amount,
  }: ApproveParams): Promise<Hex> => {
    const coinContract = getCoinContract(token)
    return coinContract.write.approve([spender, amount], { gas: 1_000_000 })
  }

  const approveDex = async ({
    token,
    amount,
  }: ApproveDexParams): Promise<Hex> => {
    return approve({ token, spender: dex().address, amount })
  }

  const buyPreGraduation = async (
    coinId: bigint,
    weiIn: bigint
  ): Promise<Hex> => {
    // @ts-expect-error TODO: christian fix typing in seismic-viem
    return pump().twrite.buy([coinId], { value: weiIn, gas: 1_000_000 })
  }

  const buyPostGraduation = ({
    token,
    amountIn,
    minAmountOut = 0n,
    deadlineMs = DEFAULT_DEADLINE_MS,
  }: TradeParams): Promise<Hex> => {
    const to = walletAddress()
    const deadline = getDeadline(deadlineMs)
    const path = [WETH_CONTRACT_ADDRESS, token]
    return dex().write.swapExactETHForTokens(
      [minAmountOut, path, to, deadline],
      {
        gas: 1_000_000,
        value: amountIn,
      }
    )
  }

  const sell = async ({
    token,
    amountIn,
    minAmountOut = 0n,
    deadlineMs = DEFAULT_DEADLINE_MS,
  }: TradeParams): Promise<Hex> => {
    const to = walletAddress()
    const path = [token, WETH_CONTRACT_ADDRESS]
    const deadline = getDeadline(deadlineMs)
    return dex().write.swapExactTokensForETH(
      [amountIn, minAmountOut, path, to, deadline],
      { gas: 1_000_000 }
    )
  }

  const approveSale = async ({
    token,
    amount,
  }: ApproveDexParams): Promise<TransactionReceipt | null> => {
    const balance = await balanceOfWallet(token)
    if (amount > balance) {
      throw new Error('Insufficient balance')
    }
    const allowance = await allowanceDex(token)
    if (amount <= allowance) {
      return null
    }
    const hash = await approveDex({ token, amount })
    return await pubClient().waitForTransactionReceipt({ hash })
  }

  const allowanceDex = async (token: Hex) => {
    return allowance({ token, spender: dex().address })
  }

  const previewBuy = async ({
    token,
    amountIn,
  }: TradeParams): Promise<bigint> => {
    const path = [WETH_CONTRACT_ADDRESS, token]
    const amount = (await dex().read.getAmountsOut([amountIn, path])) as bigint
    return amount
  }

  const previewSell = async ({
    token,
    amountIn,
  }: TradeParams): Promise<bigint> => {
    const path = [token, WETH_CONTRACT_ADDRESS]
    const amount = (await dex().read.getAmountsOut([amountIn, path])) as bigint
    return amount
  }

  return {
    walletClient,
    publicClient,
    pumpContract,
    pubClient,
    wallet,
    getWeiIn,
    createCoin,
    balanceOfErc20,
    balanceEthWallet,
    balanceOfWallet,
    allowance,
    allowanceDex,
    approve,
    approveDex,
    buyPreGraduation,
    buyPostGraduation,
    sell,
    approveSale,
    previewBuy,
    previewSell,
    error,
  }
}
