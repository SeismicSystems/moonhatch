// src/providers/Providers.tsx
import React, { PropsWithChildren } from 'react'
import { ShieldedWalletProvider } from 'seismic-react'
import { sanvil } from 'seismic-viem'
import { http } from 'viem'
import { Config, WagmiProvider } from 'wagmi'

import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const client = new QueryClient()

export const Providers: React.FC<PropsWithChildren<{ config: Config }>> = ({
  config,
  children,
}) => {
  const publicTransport = http(config.chains[0].rpcUrls.default.http[0])
  const publicChain = sanvil
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={client}>
        <RainbowKitProvider>
          <ShieldedWalletProvider
            config={config}
            options={{ publicTransport, publicChain }}
          >
            {children}
          </ShieldedWalletProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
