import { useEffect, useState } from 'react'

const STORAGE_KEY = 'app-state'
const STORAGE_EVENT = 'app-state-update'

// Define the base state interface
interface AppState {
  'terms-accepted': boolean
  weiIn: Record<string, string>
  // Add more fields here:
  // theme?: 'light' | 'dark';
  // 'notifications-enabled'?: boolean;
  //   [key: string]: any; // Allow for dynamic fields
}

// Define the default state values
const DEFAULT_STATE: AppState = {
  'terms-accepted': false,
  weiIn: {},
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
  const notifyStateChange = (newState: AppState) => {
    const event = new CustomEvent(STORAGE_EVENT, {
      detail: { newState },
    })
    window.dispatchEvent(event)
  }

  const updateState = (updates: Partial<AppState>): void => {
    try {
      const newState = { ...state, ...updates }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState))
      setState(newState)
      notifyStateChange(newState)
    } catch (error) {
      console.error('Error writing to localStorage:', error)
    }
  }

  const getField = <K extends keyof AppState>(field: K): AppState[K] => {
    return state[field]
  }

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

  const loadWeiIn = (coinId: number): bigint | null => {
    const coinsWeiIn = getField('weiIn')
    const coinWeiIn = coinsWeiIn[coinId.toString()]
    if (!coinWeiIn) return null
    return BigInt(coinWeiIn)
  }

  const saveWeiIn = (coinId: number, value: bigint) => {
    updateState({
      weiIn: {
        ...state.weiIn,
        [coinId.toString()]: value.toString(),
      },
    })
  }

  return {
    state,
    updateState,
    getField,
    setField,
    acceptTerms,
    acceptedTerms,
    loadWeiIn,
    saveWeiIn,
  } as const
}
