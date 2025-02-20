import { useState } from 'react'
import { useShieldedWallet } from 'seismic-react'
import {
  ShieldedPublicClient,
  ShieldedWalletClient,
  getShieldedContract,
} from 'seismic-viem'
import { GetContractReturnType, Hex } from 'viem'

import {
  COIN_CONTRACT_ABI,
  WETH_CONTRACT_ADDRESS,
  useDexContract,
  usePumpContract,
} from './useContract'

export const usePumpClient = () => {
  const { walletClient, publicClient } = useShieldedWallet()
  const { contract: pumpContract } = usePumpContract()
  const { contract: dexContract } = useDexContract()
  const [error, setError] = useState<string | null>(null)

  const walletAddress = (): Hex => {
    if (!walletClient) {
      setError('Wallet client not found')
      throw new Error('Wallet client not found')
    }
    return walletClient.account.address
  }

  const getWeiIn = async (coinId: bigint): Promise<bigint> => {
    if (!pumpContract) {
      setError('Pump contract not found')
      throw new Error('Pump contract not found')
    }
    const weiIn = (await pumpContract.read.getWeiIn([coinId])) as bigint
    return weiIn
  }

  const getCoinContract = (token: Hex) => {
    if (!walletClient) {
      setError('Wallet client not found')
      throw new Error('Wallet client not found')
    }
    return getShieldedContract({
      abi: COIN_CONTRACT_ABI,
      address: token,
      client: walletClient,
    })
  }

  const balanceOfErc20 = async ({
    token,
    owner,
  }: {
    token: Hex
    owner: Hex
  }): Promise<bigint> => {
    const coinContract = getCoinContract(token)
    const balance = (await coinContract.tread.balanceOf([owner])) as bigint
    return balance
  }

  const balanceOfWallet = async (token: Hex) => {
    if (!walletClient) {
      setError('Wallet client not found')
      throw new Error('Wallet client not found')
    }
    const balance = await balanceOfErc20({
      token,
      owner: walletClient.account.address,
    })
    return balance
  }

  const allowance = async ({
    token,
    spender,
  }: {
    token: Hex
    spender: Hex
  }): Promise<bigint> => {
    const coinContract = getCoinContract(token)
    const allowance = (await coinContract.tread.allowance([spender])) as bigint
    return allowance
  }

  const buyPreGraduation = async (
    coinId: bigint,
    weiIn: bigint
  ): Promise<Hex> => {
    if (!pumpContract) {
      setError('Pump contract not found')
      throw new Error('Pump contract not found')
    }
    return pumpContract.twrite.buy([coinId], { value: weiIn, gas: 1_000_000 })
  }

  const sell = async ({
    token,
    amount,
  }: {
    token: Hex
    amount: bigint
  }): Promise<Hex> => {
    if (!dexContract) {
      setError('DEX contract not found')
      throw new Error('DEX contract not found')
    }

    // TODO: param
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20

    // TODO: slippage
    const minWeiOut = 0

    const path = [token, WETH_CONTRACT_ADDRESS]
    return dexContract.write.swapExactTokensForETH(
      [amount, minWeiOut, path, userAddress, deadline],
      { gas: 1_000_000 }
    )
  }

  const allowanceDex = async (token: Hex) => {
    if (!dexContract) {
      setError('DEX contract not found')
      throw new Error('DEX contract not found')
    }
    return allowance({ token, spender: dexContract.address })
  }

  return {
    walletClient,
    publicClient,
    pumpContract,
    getWeiIn,
    balanceOfErc20,
    balanceOfWallet,
    allowance,
    allowanceDex,
    error,
  }
}
