import React, { ComponentType } from 'react'

import { usePumpClient } from '@/hooks/usePumpClient'
import { useConnectModal } from '@rainbow-me/rainbowkit'

// Props interface with optional onClick handler
interface WithOnClickProps {
  onClick?: (e: React.MouseEvent) => void
}

// Higher Order Component that checks if wallet is connected
// and redirects to connect wallet if not
export const requiresWallet = <P extends WithOnClickProps>(
  Component: ComponentType<P>
): React.FC<P> => {
  const RequiresWalletWrapper: React.FC<P> = (props) => {
    const { openConnectModal } = useConnectModal()
    const { walletAddress } = usePumpClient()

    const handleClick = (e: React.MouseEvent) => {
      if (!walletAddress) {
        e.preventDefault()
        e.stopPropagation()
        openConnectModal?.()
        return
      }

      // If the original component has an onClick prop, preserve it
      if (props.onClick && walletAddress) {
        props.onClick(e)
      }
    }

    // If wallet is connected, render the original component
    // Otherwise, render it but override the onClick to open wallet connect modal
    return <Component {...props} onClick={handleClick} />
  }

  return RequiresWalletWrapper
}
