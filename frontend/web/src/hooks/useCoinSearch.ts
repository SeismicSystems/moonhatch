import Fuse from 'fuse.js'
import { useEffect, useState } from 'react'

import { useFetchCoin } from '@/hooks/useFetchCoin'
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
  error: Error | null
}

export const useCoinSearch = (): UseCoinSearchResult => {
  const [coins, setCoins] = useState<Coin[]>([])
  const [filteredCoins, setFilteredCoins] = useState<Coin[]>([])
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [filters, setFilters] = useState<FilterState>({
    hasWebsite: false,
    hasTelegram: false,
    hasTwitter: false,
    hasAllSocials: false,
    sortByCreatedAt: true,
  })

  const { loadAllCoins, loading, error } = useFetchCoin()

  useEffect(() => {
    if (loading) return
    const allCoins = loadAllCoins()
    console.log(JSON.stringify(allCoins))
    setCoins(allCoins)
  }, [loading])

  useEffect(() => {
    let updatedCoins = [...coins]

    if (searchQuery.trim() !== '') {
      const fuse = new Fuse(coins, { keys: ['name', 'symbol'], threshold: 0.3 })
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
        ? (b.createdAt || 0) - (a.createdAt || 0)
        : (a.createdAt || 0) - (b.createdAt || 0)
    })

    setFilteredCoins(updatedCoins)
  }, [searchQuery, filters, coins])

  return {
    allCoins: coins,
    filteredCoins,
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    loading,
    error,
  }
}
