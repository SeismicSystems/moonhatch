import React, { useEffect, useState } from 'react'

import Coins from './pages/Coins'
import NavBar from './pages/NavBar'
import { useCoins } from './storage/client'
import type { Coin } from './types/coin'

const Home: React.FC = () => {
  const [coins, setCoins] = useState<Coin[]>([])
  const { loaded, getCoins } = useCoins()

  useEffect(
    () => {
      if (!loaded) {
        console.log('no public client')
        return
      }
      getCoins().then((c) => setCoins(c))
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [loaded]
  )

  return (
    <>
      <NavBar />
      <Coins coins={coins} />
    </>
  )
}

export default Home
