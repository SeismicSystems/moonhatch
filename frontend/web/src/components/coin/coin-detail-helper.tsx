// src/components/CoinDetail.tsx
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import { fetchCoin, setSelectedCoin } from '@/store/coinSlice'
import type { AppDispatch, RootState } from '@/store/store'

import CoinDetailContent from './coin-detail'

const CoinDetail: React.FC = () => {
  const { coinId } = useParams<{ coinId: string }>()
  const dispatch = useDispatch<AppDispatch>()

  const { selectedCoin, loading, error } = useSelector(
    (state: RootState) => state.coins
  )

  useEffect(() => {
    if (coinId) {
      dispatch(fetchCoin(BigInt(coinId)))
    }
  }, [coinId, dispatch])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  if (!selectedCoin) return <div>Coin not found.</div>

  return <CoinDetailContent coin={selectedCoin} />
}

export default CoinDetail
