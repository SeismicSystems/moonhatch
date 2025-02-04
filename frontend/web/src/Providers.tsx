// src/providers/Providers.tsx
import React, { PropsWithChildren } from 'react'
import { ShieldedWalletProvider } from 'seismic-react'
import { Config, WagmiProvider } from 'wagmi'

import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const client = new QueryClient()

export const Providers: React.FC<PropsWithChildren<{ config: Config }>> = ({
  config,
  children,
}) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={client}>
        <RainbowKitProvider>
          <ShieldedWalletProvider config={config}>
            {children}
          </ShieldedWalletProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
