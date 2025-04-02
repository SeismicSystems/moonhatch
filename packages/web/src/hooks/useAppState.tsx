import { useCallback, useEffect, useState } from 'react'
import { Hex } from 'viem'

const STORAGE_KEY = 'app-state'
const STORAGE_EVENT = 'app-state-update'

export type Balance<T> = { balanceUnits: T; lastUpdated: number }

// Define the base state interface
interface AppState {
  'terms-accepted': boolean
  weiIn: Record<string, string>
  balances: Record<Hex, Balance<string>>
  // Add more fields here:
  // theme?: 'light' | 'dark';
  // 'notifications-enabled'?: boolean;
  //   [key: string]: any; // Allow for dynamic fields
}

// Define the default state values
const DEFAULT_STATE: AppState = {
  'terms-accepted': false,
  weiIn: {},
  balances: {},
  // Add corresponding default values:
  // theme: 'light',
  // 'notifications-enabled': true,
}

interface AppStateChangeEvent extends Event {
  detail?: {
    newState: AppState
  }
}

export const useAppState = () => {
  const [state, setState] = useState<AppState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return DEFAULT_STATE

      const parsedState = JSON.parse(stored) as Partial<AppState>
      return { ...DEFAULT_STATE, ...parsedState }
    } catch (error) {
      console.error('Error reading from localStorage:', error)
      return DEFAULT_STATE
    }
  })

  // Listen for state changes from other components
  useEffect(() => {
    // Event handler for our custom event
    const handleStateChange = (event: AppStateChangeEvent) => {
      if (event.detail?.newState) {
        setState(event.detail.newState)
      }
    }

    // Event handler for storage changes (works across tabs)
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY && event.newValue) {
        try {
          const newState = JSON.parse(event.newValue) as Partial<AppState>
          setState({ ...DEFAULT_STATE, ...newState })
        } catch (error) {
          console.error('Error parsing localStorage update:', error)
        }
      }
    }

    // Add event listeners
    window.addEventListener(STORAGE_EVENT, handleStateChange as EventListener)
    window.addEventListener('storage', handleStorageChange)

    // Clean up
    return () => {
      window.removeEventListener(
        STORAGE_EVENT,
        handleStateChange as EventListener
      )
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  // Helper to notify all components about state changes
  const notifyStateChange = useCallback((newState: AppState) => {
    const event = new CustomEvent(STORAGE_EVENT, {
      detail: { newState },
    })
    window.dispatchEvent(event)
  }, [])

  const updateState = useCallback(
    (updates: Partial<AppState>): void => {
      try {
        const newState = { ...state, ...updates }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newState))
        setState(newState)
        notifyStateChange(newState)
      } catch (error) {
        console.error('Error writing to localStorage:', error)
      }
    },
    [state, notifyStateChange]
  )

  const getField = useCallback(
    <K extends keyof AppState>(field: K): AppState[K] => {
      return state[field]
    },
    [state]
  )

  const setField = <K extends keyof AppState>(
    field: K,
    value: AppState[K]
  ): void => {
    updateState({ [field]: value } as Partial<AppState>)
  }

  const acceptedTerms = (): boolean => {
    return getField('terms-accepted')
  }

  const acceptTerms = () => {
    return setField('terms-accepted', true)
  }

  const loadWeiIn = useCallback(
    (coinId: number): bigint | null => {
      const coinsWeiIn = getField('weiIn')
      const coinWeiIn = coinsWeiIn[coinId.toString()]
      if (!coinWeiIn) return null
      return BigInt(coinWeiIn)
    },
    [getField]
  )

  const saveWeiIn = useCallback(
    (coinId: number, value: bigint) => {
      updateState({
        weiIn: {
          ...state.weiIn,
          [coinId.toString()]: value.toString(),
        },
      })
    },
    [updateState, state.weiIn]
  )

  const loadBalance = useCallback(
    (tokenAddress: Hex): Balance<bigint> | null => {
      const balances = getField('balances')
      const balance = balances[tokenAddress]
      if (!balance) return null
      return {
        balanceUnits: BigInt(balance.balanceUnits),
        lastUpdated: balance.lastUpdated,
      }
    },
    [getField]
  )

  const saveBalance = useCallback(
    (tokenAddress: Hex, units: bigint) => {
      updateState({
        balances: {
          ...state.balances,
          [tokenAddress]: {
            balanceUnits: units.toString(),
            lastUpdated: Date.now(),
          },
        },
      })
    },
    [updateState, state.balances]
  )

  const deleteBalance = useCallback(
    (tokenAddress: Hex) => {
      updateState({
        balances: { ...state.balances, [tokenAddress]: undefined },
      })
    },
    [updateState, state.balances]
  )

  return {
    state,
    updateState,
    getField,
    setField,
    acceptTerms,
    acceptedTerms,
    loadWeiIn,
    saveWeiIn,
    loadBalance,
    saveBalance,
    deleteBalance,
  } as const
}
