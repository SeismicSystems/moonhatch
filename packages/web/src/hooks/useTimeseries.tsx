import { useState } from 'react'
import type { Hex } from 'viem'

import { BASE_API_URL } from '@/api'

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
  const [error, setError] = useState<string | null>(null)

  const fetchTimeseries = async (
    params: FetchTimeseriesParams
  ): Promise<TimeseriesDatapoint[]> => {
    const { pool, ...toEncode } = params
    const encodedParams = encodeGetParams(toEncode)
    return fetch(`${BASE_API_URL}/pool/${pool}/prices?${encodedParams}`).then(
      async (r) => {
        if (!r.ok) {
          setError(await r.text())
        }
        return r.json()
      }
    )
  }

  return { fetchTimeseries, error }
}
