import React, { useEffect, useRef } from 'react'
import { PropsWithChildren } from 'react'
import { useDispatch } from 'react-redux'
import { BrowserRouter, Route, Routes, useNavigate } from 'react-router-dom'
import { ShieldedWalletProvider } from 'seismic-react'
import { sanvil, seismicDevnet2 } from 'seismic-react/rainbowkit'
import { http } from 'viem'
import { Config, WagmiProvider } from 'wagmi'

import { WEBSOCKET_URL } from '@/api'
import WebSocketService from '@/api/websocket'
import CoinDetail from '@/components/coin/coin-detail'
import CoinForm from '@/components/create/coin-form'
import HallOfFame from '@/components/hall-of-fame/page'
import { CHAIN_ID } from '@/hooks/useContract'
import Home from '@/pages/Home'
import NotFound from '@/pages/NotFound'
import { AppDispatch } from '@/store/store'
import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import './App.css'
import { fetchAllCoinsAction } from './api/dispatch'

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
            }}
          >
            {children}
          </ShieldedWalletProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

const AppRoutes: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const wsRef = useRef<WebSocketService | null>(null)

  useEffect(() => {
    // Fetch all coins when component mounts
    dispatch(fetchAllCoinsAction())
  }, [dispatch])

  useEffect(() => {
    if (!wsRef.current) {
      const websocketService = new WebSocketService(WEBSOCKET_URL)
      websocketService.init(dispatch, navigate)
      wsRef.current = websocketService
    }
    return () => {
      if (wsRef.current) {
        wsRef.current.disconnect()
        wsRef.current = null
      }
    }
  }, [dispatch, navigate])

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/create" element={<CoinForm />} />
      <Route path="/coins/:coinId" element={<CoinDetail />} />
      <Route path="/hall-of-fame" element={<HallOfFame />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Providers config={config}>
        <AppRoutes />
      </Providers>
    </BrowserRouter>
  )
}

export default App
