import React from 'react'
import { PropsWithChildren } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ShieldedWalletProvider, sanvil, seismicDevnet2 } from 'seismic-react'
import { http } from 'viem'
import { Config, WagmiProvider } from 'wagmi'

import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import './App.css'
import { Candles } from './components/chart/Candles'
import CoinDetail from './components/coin/coin-detail'
import CoinForm from './components/create/coin-form'
import Home from './pages/Home'
import NotFound from './pages/NotFound'

const config = getDefaultConfig({
  appName: 'Pump Rand',
  projectId: 'd705c8eaf9e6f732e1ddb8350222cdac',
  chains: [sanvil, seismicDevnet2],
  ssr: true,
})

const client = new QueryClient()

const Providers: React.FC<PropsWithChildren<{ config: Config }>> = ({
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

const App: React.FC = () => {
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
