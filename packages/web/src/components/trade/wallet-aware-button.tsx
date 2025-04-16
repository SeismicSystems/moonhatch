import React from 'react'

import { Button, IconButton, IconButtonProps } from '@mui/material'

import { requiresWallet } from '../RequiresWallet'
import { GraduatedTradeButton, NonGraduatedTradeButton } from './trade-button'

// Create wallet-aware versions of the trade buttons
export const WalletAwareGraduatedTradeButton =
  requiresWallet(GraduatedTradeButton)
export const WalletAwareNonGraduatedTradeButton = requiresWallet(
  NonGraduatedTradeButton
)

// Generic wallet-aware button component
type WalletAwareButtonProps = {
  onClick: () => void
  disabled?: boolean
  className?: string
  style?: React.CSSProperties
  children: React.ReactNode
}

const BaseButton: React.FC<WalletAwareButtonProps> = ({
  onClick,
  disabled,
  className,
  style,
  children,
}) => {
  return (
    <button
      className={className}
      onClick={onClick}
      disabled={disabled}
      style={style}
    >
      {children}
    </button>
  )
}

// Create a wallet-aware IconButton component that preserves all IconButton props
const RefreshButton = (props: IconButtonProps & { onClick: () => void }) => {
  return <IconButton {...props} />
}

// Export wallet-aware buttons
export const WalletAwareButton = requiresWallet(BaseButton)
export const WalletAwareMuiButton = requiresWallet(Button)
export const WalletAwareIconButton = requiresWallet(RefreshButton)
