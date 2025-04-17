import Fuse from 'fuse.js'
import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'

import { fetchCoinByAddress } from '@/api/http'
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
  isSearchingByAddress: boolean
}

export const useCoinSearch = (): UseCoinSearchResult => {
  const coins = useSelector(selectAllCoins)
  const loading = useSelector(selectCoinsLoading)

  const [filteredCoins, setFilteredCoins] = useState<Coin[]>([])
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [isSearchingByAddress, setIsSearchingByAddress] = useState(false)
  const [filters, setFilters] = useState<Filters>({
    graduated: null,
    hasWebsite: false,
    hasTelegram: false,
    hasTwitter: false,
    hasAllSocials: false,
    oldestFirst: false,
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

  // Helper function to determine if a string looks like an Ethereum address
  const isEthereumAddress = (query: string): boolean => {
    return /^(0x)?[0-9a-fA-F]{40}$/.test(query)
  }

  useEffect(() => {
    const searchForCoins = async () => {
      let updatedCoins = [...coinsArray]
      const trimmedQuery = searchQuery.trim()

      if (trimmedQuery !== '') {
        // Check if the search query looks like an Ethereum address
        if (isEthereumAddress(trimmedQuery)) {
          setIsSearchingByAddress(true)
          const normalizedAddress = trimmedQuery.startsWith('0x')
            ? trimmedQuery
            : `0x${trimmedQuery}`

          const coin = await fetchCoinByAddress(normalizedAddress)
          if (coin) {
            updatedCoins = [coin]
          } else {
            updatedCoins = []
          }
        } else {
          setIsSearchingByAddress(false)
          updatedCoins = fuse.search(trimmedQuery).map((result) => result.item)
        }
      } else {
        setIsSearchingByAddress(false)
      }

      // Apply filters
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
        return filters.oldestFirst
          ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })

      setFilteredCoins(updatedCoins)
    }

    searchForCoins()
  }, [searchQuery, filters, coinsArray, fuse])

  return {
    allCoins: coinsArray,
    filteredCoins,
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    loading,
    isSearchingByAddress,
  }
}
