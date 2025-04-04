import { useCallback, useEffect, useState } from 'react'
import { useShieldedWallet } from 'seismic-react'
import {
  ShieldedPublicClient,
  ShieldedWalletClient,
  addressExplorerUrl,
  getShieldedContract,
  txExplorerUrl,
} from 'seismic-viem'
import type { Hex } from 'viem'

import {
  COIN_CONTRACT_ABI,
  useDexContract,
  usePumpContract,
  useWethContract,
} from '@/hooks/useContract'
import type { CreateCoinParams } from '@/types/coin'

const DEFAULT_DEADLINE_MS = 20 * 60 * 1000

// all of these were by looking at gas consumed on block explorer
// and adding a safe buffer
// TODO: remove these when we're sure estimateGas works in foundry
const GAS_LIMITS = {
  CREATE_COIN: 2_000_000,
  APPROVE: 100_000,
  BUY_PRE_GRADUATION: 400_000,
  SWAP_THRU_WETH: 150_000,
  REFUND_PURCHASE: 150_000,
  DEPLOY_GRADUATED: 3_000_000,
}

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
  const [loaded, setLoaded] = useState(false)
  const { walletClient, publicClient } = useShieldedWallet()
  const { contract: pumpContract } = usePumpContract()
  const { contract: dexContract } = useDexContract()
  const { address: wethAddress } = useWethContract()

  const [walletAddress, setWalletAddress] = useState<Hex | null>(null)

  useEffect(() => {
    if (
      walletClient &&
      publicClient &&
      pumpContract &&
      dexContract &&
      wethAddress
    ) {
      setLoaded(true)
    } else {
      setLoaded(false)
    }
  }, [walletClient, publicClient, pumpContract, dexContract, wethAddress])

  useEffect(() => {
    if (!loaded || !walletClient || !walletClient.account) {
      return
    }

    setWalletAddress(walletClient.account.address)
  }, [loaded, walletClient])

  const connectedAddress = useCallback(() => {
    if (!walletAddress) {
      throw new Error('Wallet address not found')
    }
    return walletAddress
  }, [walletAddress])

  const getDeadline = useCallback((deadlineMs: number) => {
    return Math.floor((Date.now() + deadlineMs) / 1000)
  }, [])

  const getWeiIn = useCallback(
    async (coinId: bigint): Promise<bigint> => {
      if (!pumpContract) {
        throw new Error('Pump contract not found')
      }
      const weiIn = (await pumpContract.read.getWeiIn([coinId])) as bigint
      return weiIn
    },
    [pumpContract]
  )

  const wallet = useCallback((): ShieldedWalletClient => {
    if (!walletClient) {
      throw new Error('Wallet client not found')
    }
    return walletClient
  }, [walletClient])

  const pubClient = useCallback((): ShieldedPublicClient => {
    if (!publicClient) {
      throw new Error('Public client not found')
    }
    return publicClient
  }, [publicClient])

  const dex = useCallback(() => {
    if (!dexContract) {
      throw new Error('DEX contract not found')
    }
    return dexContract as ReturnType<typeof useDexContract>['contract']
  }, [dexContract])

  const pump = useCallback(() => {
    if (!pumpContract) {
      throw new Error('Pump contract not found')
    }
    return pumpContract as ReturnType<typeof usePumpContract>['contract']
  }, [pumpContract])

  const createCoin = useCallback(
    async ({ name, symbol, supply }: CreateCoinParams): Promise<Hex> => {
      return pump().write.createCoin([name, symbol, supply], {
        gas: GAS_LIMITS.CREATE_COIN,
      })
    },
    [pump]
  )

  const getCoinContract = useCallback(
    (token: Hex) => {
      return getShieldedContract({
        abi: COIN_CONTRACT_ABI,
        address: token,
        client: wallet(),
      })
    },
    [wallet]
  )

  const balanceOfErc20 = useCallback(
    async ({ token, owner }: BalanceOfParams): Promise<bigint> => {
      const coinContract = getCoinContract(token)
      const balance = (await coinContract.tread.balanceOf([owner])) as bigint
      return balance
    },
    [getCoinContract]
  )

  const balanceOfWallet = useCallback(
    async (token: Hex): Promise<bigint> => {
      const balance = await balanceOfErc20({
        token,
        owner: connectedAddress(),
      })
      return balance
    },
    [balanceOfErc20, connectedAddress]
  )

  const balanceEthWallet = useCallback(async (): Promise<bigint> => {
    return await pubClient().getBalance({
      address: connectedAddress(),
    })
  }, [connectedAddress, pubClient])

  const allowance = useCallback(
    async ({ token, spender }: AllowanceParams): Promise<bigint> => {
      const coinContract = getCoinContract(token)
      const allowance = (await coinContract.tread.allowance([
        connectedAddress(),
        spender,
      ])) as bigint
      return allowance
    },
    [getCoinContract, connectedAddress]
  )

  const approve = useCallback(
    async ({ token, spender, amount }: ApproveParams): Promise<Hex> => {
      const coinContract = getCoinContract(token)
      return coinContract.twrite.approve([spender, amount], {
        gas: GAS_LIMITS.APPROVE,
      })
    },
    [getCoinContract]
  )

  const approveDex = useCallback(
    async ({ token, amount }: ApproveDexParams): Promise<Hex> => {
      return approve({ token, spender: dex().address, amount })
    },
    [approve, dex]
  )

  const buyPreGraduation = useCallback(
    async (coinId: bigint, weiIn: bigint): Promise<Hex> => {
      return pump().twrite.buy([coinId], {
        value: weiIn,
        gas: GAS_LIMITS.BUY_PRE_GRADUATION,
      })
    },
    [pump]
  )

  const refundPurchase = useCallback(
    async (coinId: bigint): Promise<Hex> => {
      return pump().twrite.refundPurchase([coinId], {
        gas: GAS_LIMITS.REFUND_PURCHASE,
      })
    },
    [pump]
  )

  const buyPostGraduation = useCallback(
    ({
      token,
      amountIn,
      minAmountOut = 0n,
      deadlineMs = DEFAULT_DEADLINE_MS,
    }: TradeParams): Promise<Hex> => {
      const to = connectedAddress()
      const deadline = getDeadline(deadlineMs)
      const path = [wethAddress, token]
      return dex().twrite.swapExactETHForTokens(
        [minAmountOut, path, to, deadline],
        {
          gas: GAS_LIMITS.SWAP_THRU_WETH,
          value: amountIn,
        }
      )
    },
    [connectedAddress, getDeadline, dex, wethAddress]
  )

  const sell = useCallback(
    async ({
      token,
      amountIn,
      minAmountOut = 0n,
      deadlineMs = DEFAULT_DEADLINE_MS,
    }: TradeParams): Promise<Hex> => {
      const to = connectedAddress()
      const path = [token, wethAddress]
      const deadline = getDeadline(deadlineMs)
      return dex().twrite.swapExactTokensForETH(
        [amountIn, minAmountOut, path, to, deadline],
        { gas: GAS_LIMITS.SWAP_THRU_WETH }
      )
    },
    [dex, connectedAddress, getDeadline, wethAddress]
  )

  const allowanceDex = useCallback(
    async (token: Hex) => {
      return allowance({ token, spender: dex().address })
    },
    [allowance, dex]
  )

  const approveSale = useCallback(
    async ({ token, amount }: ApproveDexParams): Promise<Hex | null> => {
      const balance = await balanceOfWallet(token)
      if (amount > balance) {
        throw new Error('Insufficient balance')
      }
      const allowance = await allowanceDex(token)
      if (amount <= allowance) {
        return null
      }
      const hash = await approveDex({ token, amount })
      return hash
    },
    [balanceOfWallet, allowanceDex, approveDex]
  )

  const previewBuy = useCallback(
    async ({ token, amountIn }: TradeParams): Promise<bigint> => {
      const path = [wethAddress, token]
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [_amountIn, amountOut] = (await dex().tread.getAmountsOut([
        amountIn,
        path,
      ])) as [bigint, bigint]
      return amountOut
    },
    [dex, wethAddress]
  )

  const previewSell = useCallback(
    async ({ token, amountIn }: TradeParams): Promise<bigint> => {
      const path = [token, wethAddress]
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [_amountIn, weiOut] = (await dex().tread.getAmountsOut([
        amountIn,
        path,
      ])) as [bigint, bigint]
      return weiOut
    },
    [dex, wethAddress]
  )

  const waitForTransaction = useCallback(
    async (hash: Hex) => {
      return await pubClient().waitForTransactionReceipt({ hash })
    },
    [pubClient]
  )

  const checkApproval = useCallback(
    async ({ token, amountIn }: TradeParams): Promise<Hex | null> => {
      const allowance = await allowanceDex(token)
      if (allowance >= amountIn) {
        return null
      }
      return await approveSale({ token, amount: amountIn })
    },
    [allowanceDex, approveSale]
  )

  const txUrl = useCallback(
    (txHash: Hex): string | null => {
      return txExplorerUrl({ chain: pubClient().chain, txHash })
    },
    [pubClient]
  )

  const addressUrl = useCallback(
    (address: Hex): string | null => {
      return addressExplorerUrl({ chain: pubClient().chain, address })
    },
    [pubClient]
  )

  const deployGraduated = useCallback(
    async (coinId: bigint): Promise<Hex> => {
      return pump().twrite.deployGraduated([coinId], {
        gas: GAS_LIMITS.DEPLOY_GRADUATED,
      })
    },
    [pump]
  )

  const getPair = useCallback(
    async (coinId: bigint): Promise<Hex> => {
      return pump().tread.getPair([coinId])
    },
    [pump]
  )

  return {
    loaded,
    walletClient,
    publicClient,
    pumpContract,
    pubClient,
    wallet,
    connectedAddress,
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
    refundPurchase,
    buyPostGraduation,
    sell,
    approveSale,
    previewBuy,
    previewSell,
    checkApproval,
    deployGraduated,
    getPair,
    waitForTransaction,
    txUrl,
    addressUrl,
  }
}
