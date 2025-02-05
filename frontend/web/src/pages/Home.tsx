import React, { useEffect, useState } from 'react'

import NavBar from '@/components/NavBar'
import { useGetCoins } from '@/hooks/useGetCoins'
import Coins from '@/pages/Coins'
import type { Coin } from '@/types/coin'

const Home: React.FC = () => {
  const [coins, setCoins] = useState<Coin[]>([])
  const { loaded, fetchCoins } = useGetCoins()

  useEffect(
    () => {
      if (!loaded) {
        console.log('no public client')
        return
      }
      fetchCoins().then((c) => setCoins(c))
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
