// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const stringifyBigInt = (_: any, value: any) =>
  typeof value === 'bigint' ? value.toString() : value
