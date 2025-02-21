import React, { useEffect, useState } from 'react'

import HomeHeader from '@/components/HomeHeader'
import NavBar from '@/components/NavBar'
import SearchAndFilter from '@/components/home/search-and-filter'
import { useCoinSearch } from '@/hooks/useCoinSearch'
import { useFetchCoin } from '@/hooks/useFetchCoin'
import Coins from '@/pages/Coins'
import type { Coin } from '@/types/coin'

const Home: React.FC = () => {
  const [coins, setCoins] = useState<Coin[]>([])
  const { loaded, fetchCoins } = useFetchCoin()
  const { filteredCoins, searchQuery, setSearchQuery, filters, setFilters } =
    useCoinSearch(coins)

  useEffect(() => {
    if (!loaded) return
    fetchCoins().then((c) => {
      const sortedCoins = [...c].sort(
        (a, b) => (b.createdAt || 0) - (a.createdAt || 0)
      )
      setCoins(sortedCoins)
    })
  }, [loaded])

  return (
    <div className="home-container">
      <div className="mb-6">
        <NavBar />
      </div>
      <HomeHeader />
      <div className="search-and-filter mb-2">
        <SearchAndFilter
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filters={filters}
          setFilters={setFilters}
        />
      </div>
      <Coins coins={filteredCoins} />
    </div>
  )
}

export default Home
