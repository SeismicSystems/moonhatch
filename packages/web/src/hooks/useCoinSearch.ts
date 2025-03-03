import Fuse from 'fuse.js'
import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'

import { selectAllCoins, selectCoinsLoading } from '@/store/slice'
import type { Coin } from '@/types/coin'

interface FilterState {
  hasWebsite: boolean
  hasTelegram: boolean
  hasTwitter: boolean
  hasAllSocials: boolean
  sortByCreatedAt: boolean
}

interface UseCoinSearchResult {
  allCoins: Coin[]
  filteredCoins: Coin[]
  searchQuery: string
  setSearchQuery: (query: string) => void
  filters: FilterState
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>
  loading: boolean
}

export const useCoinSearch = (): UseCoinSearchResult => {
  const coins = useSelector(selectAllCoins)
  const loading = useSelector(selectCoinsLoading)

  const [filteredCoins, setFilteredCoins] = useState<Coin[]>([])
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [filters, setFilters] = useState<FilterState>({
    hasWebsite: false,
    hasTelegram: false,
    hasTwitter: false,
    hasAllSocials: false,
    sortByCreatedAt: true,
  })

  // Convert coins to array for Fuse if needed and memoize
  const coinsArray = useMemo(() => {
    return Object.values(coins)
  }, [coins])

  // Memoize the Fuse instance to prevent recreation on every render
  const fuse = useMemo(() => {
    return new Fuse(coinsArray, {
      keys: ['name', 'symbol'],
      threshold: 0.3,
    })
  }, [coinsArray])

  useEffect(() => {
    let updatedCoins = [...coinsArray]

    if (searchQuery.trim() !== '') {
      updatedCoins = fuse.search(searchQuery).map((result) => result.item)
    }

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

    updatedCoins.sort((a, b) => {
      return filters.sortByCreatedAt
        ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    })

    setFilteredCoins(updatedCoins)
  }, [searchQuery, filters, coinsArray, fuse])

  return {
    allCoins: coinsArray,
    filteredCoins,
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    loading,
  }
}
