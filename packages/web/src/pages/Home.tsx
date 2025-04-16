import React from 'react'

import HomeHeader from '@/components/HomeHeader'
import NavBar from '@/components/NavBar'
import SearchAndFilter from '@/components/home/search-and-filter'
import { useCoinSearch } from '@/hooks/useCoinSearch'
import Coins from '@/pages/Coins'

const Home: React.FC = () => {
  const {
    allCoins,
    filteredCoins,
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    loading,
  } = useCoinSearch()

  if (loading) return <div>Loading coins...</div>

  return (
    <div className="home-container overflow-x-hidden">
      <div className="mb-4">
        <NavBar />
      </div>
      <div className="mb-2">
        <HomeHeader coins={allCoins} />
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
