import Fuse from 'fuse.js'
import React, { useEffect, useRef, useState } from 'react'

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
    sortByCreatedAt: true, // Default: Sort by newest first
  })

  // 🔽 Dropdown Menu State
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // 🔄 Fetch coins when component mounts
  useEffect(() => {
    if (!loaded) return
    fetchCoins().then((c) => {
      const sortedCoins = [...c].sort(
        (a, b) => (b.createdAt || 0) - (a.createdAt || 0)
      ) // Default: newest first
      setCoins(sortedCoins)
      setFilteredCoins(sortedCoins) // Show all coins initially
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

    // 🔄 Sorting by CreatedAt (Newest or Oldest)
    updatedCoins.sort((a, b) => {
      return filters.sortByCreatedAt
        ? (b.createdAt || 0) - (a.createdAt || 0) // Newest first
        : (a.createdAt || 0) - (b.createdAt || 0) // Oldest first
    })

    setFilteredCoins(updatedCoins)
  }, [searchQuery, filters, coins]) // Runs when any of these change

  // 🔽 Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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

          {/* 🎛 Filter Dropdown */}
          <div className="relative mt-2" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg"
            >
              Filter & Sort Options ▼
            </button>

            {isDropdownOpen && (
              <div className="absolute left-0 mt-2 w-56 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
                <ul className="p-2">
                  <li className="flex items-center gap-2 py-2 px-4 hover:bg-gray-100">
                    <input
                      type="checkbox"
                      checked={filters.hasWebsite}
                      onChange={() =>
                        setFilters((prev) => ({
                          ...prev,
                          hasWebsite: !prev.hasWebsite,
                        }))
                      }
                    />
                    <label>Has Website</label>
                  </li>
                  <li className="flex items-center gap-2 py-2 px-4 hover:bg-gray-100">
                    <input
                      type="checkbox"
                      checked={filters.hasTelegram}
                      onChange={() =>
                        setFilters((prev) => ({
                          ...prev,
                          hasTelegram: !prev.hasTelegram,
                        }))
                      }
                    />
                    <label>Has Telegram</label>
                  </li>
                  <li className="flex items-center gap-2 py-2 px-4 hover:bg-gray-100">
                    <input
                      type="checkbox"
                      checked={filters.hasTwitter}
                      onChange={() =>
                        setFilters((prev) => ({
                          ...prev,
                          hasTwitter: !prev.hasTwitter,
                        }))
                      }
                    />
                    <label>Has Twitter</label>
                  </li>
                  <li className="flex items-center gap-2 py-2 px-4 hover:bg-gray-100">
                    <input
                      type="checkbox"
                      checked={filters.hasAllSocials}
                      onChange={() =>
                        setFilters((prev) => ({
                          ...prev,
                          hasAllSocials: !prev.hasAllSocials,
                        }))
                      }
                    />
                    <label>Has All Socials</label>
                  </li>
                  <li className="flex items-center gap-2 py-2 px-4 hover:bg-gray-100 border-t mt-2 pt-2">
                    <button
                      onClick={() =>
                        setFilters((prev) => ({
                          ...prev,
                          sortByCreatedAt: !prev.sortByCreatedAt,
                        }))
                      }
                      className="text-blue-600"
                    >
                      Sort by:{' '}
                      {filters.sortByCreatedAt
                        ? 'Newest First'
                        : 'Oldest First'}
                    </button>
                  </li>
                </ul>
              </div>
            )}
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
