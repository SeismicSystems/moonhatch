import React, { useEffect, useState } from 'react'

import { useCoins } from '../hooks/client'
import type { Coin } from '../types/coin'
import Coins from './Coins'
import NavBar from './NavBar'

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
