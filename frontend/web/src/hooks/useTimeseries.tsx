import type { Hex } from 'viem'

import { initialData } from './mockPriceData'

// import { BASE_API_URL } from './useFetchCoin'

type FetchTimeseriesParams = {
  pool: Hex
  maxTs?: number
  minTs?: number
  limit?: number
}

export type TimeseriesDatapoint = {
  time: string
  open: number
  high: number
  low: number
  close: number
}

const encodeGetParams = (p: { [key: string]: string | number | boolean }) =>
  Object.entries(p)
    .map((kv) => kv.map(encodeURIComponent).join('='))
    .join('&')

export const useTimeseries = () => {
  const fetchTimeseries = async (
    params: FetchTimeseriesParams
  ): Promise<TimeseriesDatapoint[]> => {
    const { pool, ...toEncode } = params
    const encodedParams = encodeGetParams(toEncode)
    // return fetch(`${BASE_API_URL}/pools/${pool}?${encodedParams}`).then((r) =>
    //   r.json()
    // )
    // TODO: remove
    if (pool || encodedParams) {
      return initialData
    }
    return initialData
  }

  return { fetchTimeseries }
}
