import React, { useEffect, useState } from 'react'

import HomeHeader from '@/components/HomeHeader'
import NavBar from '@/components/NavBar'
import { useFetchCoin } from '@/hooks/useFetchCoin'
import Coins from '@/pages/Coins'
import type { Coin } from '@/types/coin'

const Home: React.FC = () => {
  const [coins, setCoins] = useState<Coin[]>([])
  const { loaded, fetchCoins } = useFetchCoin()
  useEffect(
    () => {
      if (!loaded) {
        console.log('no public client')
        return
      }
      fetchCoins().then((c) => setCoins([...c].reverse()))
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [loaded]
  )

  return (
    <>
      <div className="home-container">
        <NavBar />
        <HomeHeader />
        <Coins coins={coins} />
        {!loaded && (
          <div className="h-96 flex items-center justify-center">
            <div className="w-96 h-96 border-4 border-pink-200 rounded-full border-t-transparent animate-spin" />
          </div>
        )}
      </div>
    </>
  )
}

export default Home
