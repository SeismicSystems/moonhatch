import type { Abi, Hex } from 'viem'

export type ContractData = {
  contractAddress: Hex
  methodIdentifiers: { [functionSignature: string]: Hex }
  abi: Abi
}
