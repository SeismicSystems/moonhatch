import React, { useEffect, useRef } from 'react'
import { PropsWithChildren } from 'react'
import { useDispatch } from 'react-redux'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ShieldedWalletProvider, sanvil, seismicDevnet2 } from 'seismic-react'
import { checkFaucet } from 'seismic-viem'
import { http } from 'viem'
import { Config, WagmiProvider } from 'wagmi'

import { WEBSOCKET_URL } from '@/api'
import { fetchAllCoins } from '@/api/http'
import WebSocketService from '@/api/websocket'
import CoinDetail from '@/components/coin/coin-detail'
import CoinForm from '@/components/create/coin-form'
import { CHAIN_ID } from '@/hooks/useContract'
import Home from '@/pages/Home'
import NotFound from '@/pages/NotFound'
import { AppDispatch, store } from '@/store/store'
import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import './App.css'

const FAUCET_URL = import.meta.env.VITE_FAUCET_URL
const SUPPORTED_CHAINS = [sanvil, seismicDevnet2]
const CHAINS = SUPPORTED_CHAINS.filter((c) => c.id === CHAIN_ID)

const config = getDefaultConfig({
  appName: 'Pump Rand',
  projectId: 'd705c8eaf9e6f732e1ddb8350222cdac',
  // @ts-expect-error: this is fine
  chains: CHAINS,
  ssr: false,
})

const client = new QueryClient()

const Providers: React.FC<PropsWithChildren<{ config: Config }>> = ({
  config,
  children,
}) => {
  const publicChain = CHAINS[0]
  const publicTransport = http(publicChain.rpcUrls.default.http[0])
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={client}>
        <RainbowKitProvider>
          <ShieldedWalletProvider
            config={config}
            options={{
              publicTransport,
              publicChain,
              onAddressChange: async ({ publicClient, address }) => {
                if (!FAUCET_URL) {
                  return
                }
                await checkFaucet({
                  address,
                  publicClient,
                  faucetUrl: FAUCET_URL,
                  minBalanceEther: 0.5,
                })
              },
            }}
          >
            {children}
          </ShieldedWalletProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

const App: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const wsRef = useRef<WebSocketService | null>(null)

  useEffect(() => {
    // Fetch all coins when component mounts
    dispatch(fetchAllCoins())
  }, [dispatch])

  useEffect(() => {
    if (!wsRef.current) {
      const websocketService = new WebSocketService(WEBSOCKET_URL)
      websocketService.init(store.dispatch)
      wsRef.current = websocketService
    }
    return () => {
      if (wsRef.current) {
        wsRef.current.disconnect()
        wsRef.current = null
      }
    }
  }, [])

  return (
    <BrowserRouter>
      <Providers config={config}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CoinForm />} />
          <Route path="/coins/:coinId" element={<CoinDetail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Providers>
    </BrowserRouter>
  )
}

export default App
