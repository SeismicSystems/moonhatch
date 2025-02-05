import { useShieldedContract } from 'seismic-react'

import type { ContractData } from '@/types/contract'

const loadContractData = async ({
  name,
  chainId,
}: {
  name: string
  chainId: string | undefined
}): Promise<ContractData> => {
  // Check if VITE_CHAIN_ID is set
  if (!chainId) {
    throw new Error('loadContractData failed: chainId not set')
  }

  // Construct the file path (vite makes this load from /public directory)
  const configPath = `/chains/${chainId}/${name}.json`

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

const CHAIN_ID = import.meta.env.VITE_CHAIN_ID

const pumpContractData = await loadContractData({
  name: 'PumpRand',
  chainId: CHAIN_ID,
})

export const PUMP_CONTRACT_ADDRESS = pumpContractData.address
export const PUMP_CONTRACT_ABI = pumpContractData.abi

export const useContract = () => {
  return useShieldedContract({
    abi: PUMP_CONTRACT_ABI,
    address: PUMP_CONTRACT_ADDRESS,
  })
}
