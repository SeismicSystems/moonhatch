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
    error,
  } = useCoinSearch()

  if (loading) return <div>Loading coins...</div>
  if (error) return <div>Error loading coins: {error.message}</div>

  return (
    <div className="home-container">
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
