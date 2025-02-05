import type { Abi, Hex } from 'viem'

export type ContractData = {
  address: Hex
  methodIdentifiers: { [functionSignature: string]: Hex }
  abi: Abi
}
