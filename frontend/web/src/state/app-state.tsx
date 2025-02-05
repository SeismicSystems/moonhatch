import { useState } from 'react'

const STORAGE_KEY = 'app-state'

// Define the base state interface
interface AppState {
  'terms-accepted': boolean
  // Add more fields here:
  // theme?: 'light' | 'dark';
  // 'notifications-enabled'?: boolean;
  //   [key: string]: any; // Allow for dynamic fields
}

// Define the default state values
const DEFAULT_STATE: AppState = {
  'terms-accepted': false,
  // Add corresponding default values:
  // theme: 'light',
  // 'notifications-enabled': true,
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

  const updateState = (updates: Partial<AppState>): void => {
    try {
      const newState = { ...state, ...updates }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState))
      setState(newState)
    } catch (error) {
      console.error('Error writing to localStorage:', error)
    }
  }

  const resetState = (): void => {
    try {
      localStorage.removeItem(STORAGE_KEY)
      setState(DEFAULT_STATE)
    } catch (error) {
      console.error('Error removing from localStorage:', error)
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

  return {
    state,
    updateState,
    resetState,
    getField,
    setField,
    acceptTerms,
    acceptedTerms,
  } as const
}
