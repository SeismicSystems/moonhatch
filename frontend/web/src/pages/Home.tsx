import { AnimatePresence, motion } from 'framer-motion'
import Fuse from 'fuse.js'
import React, { useEffect, useRef, useState } from 'react'

import HomeHeader from '@/components/HomeHeader'
import NavBar from '@/components/NavBar'
import { useFetchCoin } from '@/hooks/useFetchCoin'
import Coins from '@/pages/Coins'
import type { Coin } from '@/types/coin'
import FilterListIcon from '@mui/icons-material/FilterList'

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
    sortByCreatedAt: true, // Default: Newest First
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
        <div className="relative flex w-full justify-center items-center mt-6">
          {/* Search Bar - Always Centered */}
          <input
            type="text"
            placeholder="SEARCH NAME/TICKER"
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64 text-xs uppercase  text-[var(--creamWhite)] h-12 md:w-80 lg:w-96 p-2 rounded-md  text-center"
          />

          {/* 🎛 Filter Dropdown - Always to the Right */}
          <div
            className="absolute right-20  lg:mr-24 xl:mr-72"
            ref={dropdownRef}
          >
            <button
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className="px-4 py-2 h-12 bg-[var(--midBlue)] text-[var(--creamWhite)] rounded-lg flex items-center justify-center"
            >
              <span className="hidden md:inline mr-1 ">FILTER</span>
              <FilterListIcon className="md:hidden text-[var(--creamWhite)] text-lg" />{' '}
              {/* Mobile icon */}
            </button>
          </div>
        </div>
        {/* Dropdown with Smooth Animation */}
        <AnimatePresence>
          {isDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="absolute right-0 md:right-10 lg:right-30 xl:right-80  mt-2 w-56 bg-[var(--lightBlue)] border border-gray-300 rounded-lg shadow-lg z-50 md:w-max"
            >
              <ul className="p-2 bg-[var(--midBlue)] text-[var(--creamWhite)] rounded-lg">
                {/* 🏆 SORT BY SECTION */}
                <li className="flex items-center gap-2 py-2 px-4 rounded-md font-bold text-[var(--creamWhite)]">
                  SORT BY:
                </li>
                <li
                  className={`flex items-center gap-2 py-2 px-4 cursor-pointer rounded-md ${
                    filters.sortByCreatedAt
                      ? 'bg-[var(--darkBlue)]'
                      : 'hover:bg-[var(--midBlue)]'
                  }`}
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      sortByCreatedAt: true,
                    }))
                  }
                >
                  <div className="relative w-5 h-5 border-2 border-[var(--creamWhite)] rounded-md flex items-center justify-center">
                    {filters.sortByCreatedAt && (
                      <div className="w-3 h-3 bg-[var(--creamWhite)] rounded-sm"></div>
                    )}
                  </div>
                  NEWEST
                </li>
                <li
                  className={`flex items-center gap-2 py-2 px-4 cursor-pointer rounded-md ${
                    !filters.sortByCreatedAt
                      ? 'bg-[var(--darkBlue)]'
                      : 'hover:bg-[var(--midBlue)]'
                  }`}
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      sortByCreatedAt: false,
                    }))
                  }
                >
                  <div className="relative w-5 h-5 border-2 border-[var(--creamWhite)] rounded-md flex items-center justify-center">
                    {!filters.sortByCreatedAt && (
                      <div className="w-3 h-3 bg-[var(--creamWhite)] rounded-sm"></div>
                    )}
                  </div>
                  OLDEST
                </li>

                {/* 🏆 FILTER SECTION */}
                <li className="flex items-center gap-2 py-2 px-4 rounded-md font-bold text-[var(--creamWhite)]">
                  FILTERS:
                </li>
                {[
                  { key: 'hasWebsite', label: 'WEBSITE' },
                  { key: 'hasTelegram', label: 'TELEGRAM' },
                  { key: 'hasTwitter', label: 'X' },
                  { key: 'hasAllSocials', label: 'ALL SOCIALS' },
                ].map(({ key, label }) => (
                  <li
                    key={key}
                    className={`flex items-center gap-2 py-2 px-4 cursor-pointer rounded-md ${
                      filters[key]
                        ? 'bg-[var(--darkBlue)] text-[var(--creamWhite)]'
                        : 'hover:bg-[var(--midBlue)]'
                    }`}
                    onClick={() =>
                      setFilters((prev) => ({ ...prev, [key]: !prev[key] }))
                    }
                  >
                    <div className="relative w-5 h-5 border-2 border-[var(--creamWhite)] rounded-md flex items-center justify-center">
                      {filters[key] && (
                        <div className="w-3 h-3 bg-[var(--creamWhite)] rounded-sm"></div>
                      )}
                    </div>
                    <label className="cursor-pointer">{label}</label>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 🎯 Display Filtered Coins */}
      <Coins coins={filteredCoins} />
    </>
  )
}

export default Home
