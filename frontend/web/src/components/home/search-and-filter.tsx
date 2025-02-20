import { AnimatePresence, motion } from 'framer-motion'
import React, { useEffect, useRef, useState } from 'react'

import FilterListIcon from '@mui/icons-material/FilterList'

interface SearchAndFilterProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  filters: {
    hasWebsite: boolean
    hasTelegram: boolean
    hasTwitter: boolean
    hasAllSocials: boolean
    sortByCreatedAt: boolean
  }
  setFilters: React.Dispatch<React.SetStateAction<typeof filters>>
}

const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  searchQuery,
  setSearchQuery,
  filters,
  setFilters,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

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
    <div className="relative flex w-full justify-center items-center mt-6">
      <input
        type="text"
        placeholder="SEARCH NAME/TICKER"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-64 text-xs lg:text-lg uppercase text-[var(--creamWhite)] h-12 lg:h-16 md:w-80 lg:w-96 p-2 rounded-md text-center"
      />

      <div className="absolute right-20 lg:mr-24 xl:mr-72" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen((prev) => !prev)}
          className="px-4 py-2 h-12 lg:h-16 bg-[var(--midBlue)] text-[var(--creamWhite)] rounded-lg flex items-center justify-center"
        >
          <span className="hidden md:inline mr-1">FILTER</span>
          <FilterListIcon className="md:hidden text-[var(--creamWhite)] text-lg" />
        </button>

        <AnimatePresence>
          {isDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="absolute right-0 mt-2 w-56 bg-[var(--lightBlue)] border border-gray-300 rounded-lg shadow-lg z-50 md:w-max"
            >
              <ul className="p-2 bg-[var(--midBlue)] text-[var(--creamWhite)] rounded-lg">
                <li className="flex items-center gap-2 py-2 px-4 rounded-md font-bold text-[var(--creamWhite)]">
                  SORT BY:
                </li>
                <li
                  className="flex items-center gap-2 py-2 px-4 cursor-pointer rounded-md hover:bg-[var(--darkBlue)]"
                  onClick={(e) => {
                    e.stopPropagation()
                    setFilters((prev) => ({
                      ...prev,
                      sortByCreatedAt: true,
                    }))
                  }}
                >
                  <div className="relative w-5 h-5 border-2 border-[var(--creamWhite)] rounded-md flex items-center justify-center">
                    {filters.sortByCreatedAt && (
                      <div className="w-3 h-3 bg-[var(--creamWhite)] rounded-sm"></div>
                    )}
                  </div>
                  NEWEST
                </li>
                <li
                  className="flex items-center gap-2 py-2 px-4 cursor-pointer rounded-md hover:bg-[var(--darkBlue)]"
                  onClick={(e) => {
                    e.stopPropagation()
                    setFilters((prev) => ({
                      ...prev,
                      sortByCreatedAt: false,
                    }))
                  }}
                >
                  <div className="relative w-5 h-5 border-2 border-[var(--creamWhite)] rounded-md flex items-center justify-center">
                    {!filters.sortByCreatedAt && (
                      <div className="w-3 h-3 bg-[var(--creamWhite)] rounded-sm"></div>
                    )}
                  </div>
                  OLDEST
                </li>
                <li className="border-t border-[var(--creamWhite)] my-2"></li>

                {[
                  { key: 'hasWebsite', label: 'WEBSITE' },
                  { key: 'hasTelegram', label: 'TELEGRAM' },
                  { key: 'hasTwitter', label: 'X' },
                  { key: 'hasAllSocials', label: 'ALL SOCIALS' },
                ].map(({ key, label }) => (
                  <li
                    key={key}
                    className="flex items-center gap-2 py-2 px-4 cursor-pointer rounded-md hover:bg-[var(--darkBlue)]"
                    onClick={(e) => {
                      e.stopPropagation()
                      setFilters((prev) => ({ ...prev, [key]: !prev[key] }))
                    }}
                  >
                    <div className="relative w-5 h-5 border-2 border-[var(--creamWhite)] rounded-md flex items-center justify-center">
                      {filters[key] && (
                        <div className="w-3 h-3 bg-[var(--creamWhite)] rounded-sm"></div>
                      )}
                    </div>
                    {label}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default SearchAndFilter
