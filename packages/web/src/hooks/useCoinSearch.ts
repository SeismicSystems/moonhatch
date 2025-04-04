import Fuse from 'fuse.js'
import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'

import { selectAllCoins, selectCoinsLoading } from '@/store/slice'
import type { Coin } from '@/types/coin'
import { Filters } from '@/types/filter'

type UseCoinSearchResult = {
  allCoins: Coin[]
  filteredCoins: Coin[]
  searchQuery: string
  setSearchQuery: (query: string) => void
  filters: Filters
  setFilters: React.Dispatch<React.SetStateAction<Filters>>
  loading: boolean
}

export const useCoinSearch = (): UseCoinSearchResult => {
  const coins = useSelector(selectAllCoins)
  const loading = useSelector(selectCoinsLoading)

  const [filteredCoins, setFilteredCoins] = useState<Coin[]>([])
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [filters, setFilters] = useState<Filters>({
    graduated: undefined,
    hasWebsite: false,
    hasTelegram: false,
    hasTwitter: false,
    hasAllSocials: false,
    newestFirst: true,
  })

  // Convert coins to array for Fuse if needed and memoize
  const coinsArray = useMemo(() => {
    return Object.values(coins).filter((coin) => !coin.hidden)
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

    if (filters.graduated === true) {
      updatedCoins = updatedCoins.filter((coin) => coin.graduated)
    } else if (filters.graduated === false) {
      updatedCoins = updatedCoins.filter((coin) => !coin.graduated)
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
      return filters.newestFirst
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
