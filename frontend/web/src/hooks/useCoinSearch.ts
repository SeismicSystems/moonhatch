import Fuse from 'fuse.js'
import { useEffect, useState } from 'react'

import type { Coin } from '@/types/coin'

interface FilterState {
  hasWebsite: boolean
  hasTelegram: boolean
  hasTwitter: boolean
  hasAllSocials: boolean
  sortByCreatedAt: boolean
}

interface UseCoinSearchResult {
  filteredCoins: Coin[]
  searchQuery: string
  setSearchQuery: (query: string) => void
  filters: FilterState
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>
}

export const useCoinSearch = (coins: Coin[]): UseCoinSearchResult => {
  const [filteredCoins, setFilteredCoins] = useState<Coin[]>(coins)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [filters, setFilters] = useState<FilterState>({
    hasWebsite: false,
    hasTelegram: false,
    hasTwitter: false,
    hasAllSocials: false,
    sortByCreatedAt: true, // Default: Newest First
  })

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
  }, [searchQuery, filters, coins])

  return {
    filteredCoins,
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
  }
}
