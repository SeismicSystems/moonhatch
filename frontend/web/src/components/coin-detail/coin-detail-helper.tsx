// Example update in your CoinDetail component
import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'

import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchCoinsAsync, selectCoinById } from '@/store/slices/coinSlice'

import { CoinDetailContent } from '../coin/coin-detail'

const CoinDetail: React.FC = () => {
  const { coinId } = useParams<{ coinId: string }>()
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (coinId) {
      dispatch(fetchCoinsAsync())
    }
  }, [dispatch, coinId])

  const coin = useAppSelector((state) =>
    coinId ? selectCoinById(state, BigInt(coinId)) : undefined
  )

  if (!coin) return <div>Coin not found.</div>

  return <CoinDetailContent coin={coin} />
}

export default CoinDetail
