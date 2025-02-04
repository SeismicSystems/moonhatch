import React, { useEffect, useState } from 'react'

import Coins from './pages/Coins'
import NavBar from './pages/NavBar'
import { Coin, useCoins } from './storage/client'

const Home: React.FC = () => {
  const [coins, setCoins] = useState<Coin[]>([])
  const { getCoins } = useCoins()

  useEffect(() => {
    getCoins().then((c) => setCoins(c))
  }, [getCoins])

  return (
    <>
      <NavBar />
      <Coins coins={coins} />
    </>
  )
}

export default Home
