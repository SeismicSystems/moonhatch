// src/pages/Home.tsx
import React, { useEffect } from 'react'

import HomeHeader from '@/components/HomeHeader'
import NavBar from '@/components/NavBar'
import SearchAndFilter from '@/components/home/search-and-filter'
import { useCoinSearch } from '@/hooks/useCoinSearch'
import Coins from '@/pages/Coins'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchCoinsAsync } from '@/store/slices/coinSlice'

const Home: React.FC = () => {
  const dispatch = useAppDispatch()
  const coins = useAppSelector((state) => state.coins.coins)
  const loading = useAppSelector((state) => state.coins.loading)
  const error = useAppSelector((state) => state.coins.error)

  const { filteredCoins, searchQuery, setSearchQuery, filters, setFilters } =
    useCoinSearch(coins)

  useEffect(() => {
    dispatch(fetchCoinsAsync())
  }, [dispatch])

  if (loading) return <div>Loading coins...</div>
  if (error) return <div>Error loading coins: {error}</div>
  return (
    <div className="home-container">
      <div className="mb-4">
        <NavBar />
      </div>
      <div className="mb-2">
        <HomeHeader
          coins={coins.map((coin) => ({ ...coin, id: coin.id.toString() }))}
        />
      </div>
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
