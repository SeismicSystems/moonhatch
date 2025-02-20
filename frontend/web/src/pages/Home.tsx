import Fuse from 'fuse.js'
import React, { useEffect, useState } from 'react'

import HomeHeader from '@/components/HomeHeader'
import NavBar from '@/components/NavBar'
import { useFetchCoin } from '@/hooks/useFetchCoin'
import Coins from '@/pages/Coins'
import type { Coin } from '@/types/coin'

const Home: React.FC = () => {
  const [coins, setCoins] = useState<Coin[]>([])
  const [filteredCoins, setFilteredCoins] = useState<Coin[]>([])
  const { loaded, fetchCoins } = useFetchCoin()

  // 🔍 Search & Filter States
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [filters, setFilters] = useState({
    hasWebsite: false,
    hasTelegram: false,
    hasTwitter: false,
    hasAllSocials: false,
    sortByCreatedAt: false,
  })

  // 🔄 Fetch coins when component mounts
  useEffect(() => {
    if (!loaded) return
    fetchCoins().then((c) => {
      const reversedCoins = [...c].reverse()
      setCoins(reversedCoins)
      setFilteredCoins(reversedCoins) // Show all coins initially
    })
  }, [loaded])

  // 🔍 Apply Search & Filtering
  useEffect(() => {
    let updatedCoins = [...coins]

    // 🔍 Fuse.js for Search
    if (searchQuery.trim() !== '') {
      const fuse = new Fuse(coins, { keys: ['name', 'symbol'], threshold: 0.3 })
      updatedCoins = fuse.search(searchQuery).map((result) => result.item)
    }

    // 🎛 Filters
    if (filters.hasWebsite)
      updatedCoins = updatedCoins.filter((coin) => coin.website)
    if (filters.hasTelegram)
      updatedCoins = updatedCoins.filter((coin) => coin.telegram)
    if (filters.hasTwitter)
      updatedCoins = updatedCoins.filter((coin) => coin.twitter)
    if (filters.hasAllSocials)
      updatedCoins = updatedCoins.filter(
        (coin) => coin.website && coin.telegram && coin.twitter
      )
    if (filters.sortByCreatedAt)
      updatedCoins.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))

    setFilteredCoins(updatedCoins)
  }, [searchQuery, filters, coins]) // Runs when any of these change

  console.log(filteredCoins)
  return (
    <>
      <div className="home-container">
        <NavBar />
        <HomeHeader />

        {/* 🔍 Search Bar */}
        <div className="mt-6 flex flex-col items-center">
          <input
            type="text"
            placeholder="Search for a coin..."
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64 md:w-80 lg:w-96 p-2 bg-white rounded-md text-black"
          />

          {/* 🎛 Filter Buttons */}
          <div className="flex gap-4 mt-2">
            <button
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  hasWebsite: !prev.hasWebsite,
                }))
              }
              className="px-4 py-2 bg-gray-800 text-white rounded-lg"
            >
              Website
            </button>
            <button
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  hasTelegram: !prev.hasTelegram,
                }))
              }
              className="px-4 py-2 bg-gray-800 text-white rounded-lg"
            >
              Telegram
            </button>
            <button
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  hasTwitter: !prev.hasTwitter,
                }))
              }
              className="px-4 py-2 bg-gray-800 text-white rounded-lg"
            >
              Twitter
            </button>
            <button
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  hasAllSocials: !prev.hasAllSocials,
                }))
              }
              className="px-4 py-2 bg-gray-800 text-white rounded-lg"
            >
              All Socials
            </button>
          </div>
        </div>

        {/* 🎯 Display Filtered Coins */}
        <Coins coins={filteredCoins} />

        {!loaded && (
          <div className="h-96 flex items-center justify-center">
            <div className="w-96 h-96 border-4 border-pink-200 rounded-full border-t-transparent animate-spin" />
          </div>
        )}
      </div>
    </>
  )
}

export default Home
