import { useShieldedContract } from 'seismic-react'

import type { DeployedContract, ContractInterface } from '@/types/contract'

import * as pumpJson from '@/abis/contracts/PumpRand.json' assert { type: 'json' }
import * as dexJson from '@/abis/contracts/UniswapV2Router02.json' assert { type: 'json' }
import * as coinJson from '@/abis/interfaces/IPumpCoin.json' assert { type: 'json' }
import * as wethJson from '@/abis/contracts/WETH9.json' assert { type: 'json' }

const parseChainId = (): number => {
  const chainId = '5124' // process.env.CHAIN_ID
  if (!chainId) {
    throw new Error('CHAIN_ID is not set')
  }
  return parseInt(chainId)
}

export const CHAIN_ID = parseChainId()

export const COIN_CONTRACT_ABI = (coinJson as ContractInterface).abi

export const usePumpContract = () => useShieldedContract(pumpJson as DeployedContract)
export const useDexContract = () => useShieldedContract(dexJson as DeployedContract)
export const useWethContract = () => useShieldedContract(wethJson as DeployedContract)
