import { useShieldedContract } from 'seismic-react'
import { Hex } from 'viem'

import type { ContractData } from '@/types/contract'

export const CHAIN_ID = import.meta.env.VITE_CHAIN_ID

const loadContractData = async ({
  name,
  chainId = CHAIN_ID,
}: {
  name: string
  chainId?: Hex | undefined
}): Promise<ContractData> => {
  // Check if VITE_CHAIN_ID is set
  if (!chainId) {
    throw new Error('loadContractData failed: chainId not set')
  }

  // Construct the file path (vite makes this load from /public directory)
  const configPath = `/chains/${CHAIN_ID}/contracts/${name}.json`

  try {
    const response = await fetch(configPath)
    if (!response.ok) {
      throw new Error(`Chain configuration file not found at: ${configPath}`)
    }

    return await response.json()
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON in chain configuration file: ${configPath}`)
    }

    // @ts-expect-error: error will have a message
    throw new Error(`Error reading chain configuration: ${error.message}`)
  }
}

const pumpContractData = await loadContractData({ name: 'PumpRand' })
const dexContractData = await loadContractData({ name: 'UniswapV2Router02' })

export const PUMP_CONTRACT_ADDRESS = pumpContractData.address
export const PUMP_CONTRACT_ABI = pumpContractData.abi
export const usePumpContract = () =>
  useShieldedContract({
    abi: PUMP_CONTRACT_ABI,
    address: PUMP_CONTRACT_ADDRESS,
  })

export const DEX_CONTRACT_ADDRESS = dexContractData.address
export const DEX_CONTRACT_ABI = dexContractData.abi
export const useDexContract = () =>
  useShieldedContract({ abi: DEX_CONTRACT_ABI, address: DEX_CONTRACT_ADDRESS })
