// CoinDetail.tsx
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { useFetchCoin } from '@/hooks/useFetchCoin'
import type { Coin } from '@/types/coin'

const CoinDetail: React.FC = () => {
  const { coinId } = useParams<{ coinId: string }>()
  const { fetchCoins, loaded, loading, error } = useFetchCoin()
  const [coin, setCoin] = useState<Coin | null>(null)

  useEffect(() => {
    // Wait until the contract is loaded
    if (!loaded) return

    // Fetch all coins and then find the one that matches coinId
    fetchCoins().then((coins) => {
      // Since your coins' id is stored as a number, parse coinId from URL
      const id = Number(coinId)
      const foundCoin = coins.find((c) => c.id === BigInt(id))
      setCoin(foundCoin || null)
    })
  }, [loaded, coinId])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  if (!coin) return <div>Coin not found.</div>

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Reuse your coin-card component to display the coin details */}
      <div className="coin-name">name -{coin.name}</div>
      <div className="coin-ticker">ticker - {coin.symbol}</div>
      <div className="coin-address">address - {coin.contractAddress}</div>
      <div className="coin-created-at">
        created-at - {coin.createdAt.toString()}
      </div>
      <div className="coin-supply">supply - {coin.supply.toString()}</div>
      <div className="coin-graduated">graduated - {coin.graduated}</div>
      <div className="coin-image">
        img-{' '}
        <img
          src="https://seismic-public-assets.s3.us-east-1.amazonaws.com/seismic-logo-light.png"
          alt="alt"
        ></img>
      </div>
      {/* {coin.name}
      {coin.name}
      {coin.name}
      {coin.name}
      {coin.name} */}
      {/* You can add more details here if needed */}
    </div>
  )
}

export default CoinDetail
