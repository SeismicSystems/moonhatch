import type { Abi, Hex } from 'viem'

export type ContractInterface = {
  abi: Abi
  methodIdentifiers: { [functionSignature: string]: Hex }
}

export type DeployedContract = ContractInterface & {
  address: Hex
}
