import { useShieldedContract } from 'seismic-react'
import { Abi, Hex } from 'viem'

type ContractData = {
  contractAddress: Hex
  methodIdentifiers: { [functionSignature: string]: Hex }
  abi: Abi
}

const loadContractData = async (
  chainId: string | undefined
): Promise<ContractData> => {
  // Check if VITE_CHAIN_ID is set
  if (!chainId) {
    throw new Error('loadContractData failed: chainId not set')
  }

  // Construct the file path
  const configPath = `/chains/${chainId}.json`

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

const contractData = await loadContractData(import.meta.env.VITE_CHAIN_ID)

export const CONTRACT_ADDRESS = contractData.contractAddress
export const CONTRACT_ABI = contractData.abi

export const usePumpContract = () =>
  useShieldedContract({ abi: CONTRACT_ABI, address: CONTRACT_ADDRESS })
