import React, { useEffect, useState } from 'react'
import { useShieldedWallet } from 'seismic-react'

import Coins from './pages/Coins'
import NavBar from './pages/NavBar'
import { useCoins } from './storage/client'
import type { Coin } from './types/coin'

const Home: React.FC = () => {
  const [coins, setCoins] = useState<Coin[]>([])
  const { publicClient } = useShieldedWallet()
  const { getCoins } = useCoins()

  useEffect(
    () => {
      if (!publicClient) {
        return
      }
      getCoins().then((c) => setCoins(c))
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [publicClient]
  )

  return (
    <>
      <NavBar />
      <Coins coins={coins} />
    </>
  )
}

export default Home
