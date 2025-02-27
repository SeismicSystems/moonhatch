import { useShieldedContract } from 'seismic-react'

import * as pumpJson from '@/abis/contracts/PumpRand.json' with { type: 'json' }
import * as dexJson from '@/abis/contracts/UniswapV2Router02.json' with { type: 'json' }
import * as wethJson from '@/abis/contracts/WETH9.json' with { type: 'json' }
import * as coinJson from '@/abis/interfaces/IPumpCoin.json' with { type: 'json' }
import type { ContractInterface, DeployedContract } from '@/types/contract'

const parseChainId = (): number => {
  const chainId = import.meta.env.VITE_CHAIN_ID
  if (!chainId) {
    throw new Error('CHAIN_ID is not set')
  }
  return parseInt(chainId)
}

export const CHAIN_ID = parseChainId()

export const COIN_CONTRACT_ABI = (coinJson as ContractInterface).abi

export const usePumpContract = () =>
  useShieldedContract(pumpJson as DeployedContract)
export const useDexContract = () =>
  useShieldedContract(dexJson as DeployedContract)
export const useWethContract = () =>
  useShieldedContract(wethJson as DeployedContract)
