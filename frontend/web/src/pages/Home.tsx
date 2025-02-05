import React, { useEffect, useState } from 'react'

import { useGetCoins } from '../state/get-coins'
import type { Coin } from '../types/coin'
import Coins from './Coins'
import NavBar from './NavBar'

const Home: React.FC = () => {
  const [coins, setCoins] = useState<Coin[]>([])
  const { loaded, getCoins } = useGetCoins()

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
