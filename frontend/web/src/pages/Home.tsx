import React, { useEffect, useState } from 'react'

import NavBar from '@/components/NavBar'
import { useFetchCoin } from '@/hooks/useFetchCoin'
import Coins from '@/pages/Coins'
import type { Coin } from '@/types/coin'

const Home: React.FC = () => {
  const [coins, setCoins] = useState<Coin[]>([])
  const { loaded, fetchCoins } = useFetchCoin({
    coinDetail: 'http://127.0.0.1:3000/coin',
    allCoins: 'http://127.0.0.1:3000/coins',
  })
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
      <div className="home-container overflow-y-scroll">
        <NavBar />
        <Coins coins={coins} />
      </div>
    </>
  )
}

export default Home
