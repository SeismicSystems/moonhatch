import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { sanvil } from 'seismic-react'

import { getDefaultConfig } from '@rainbow-me/rainbowkit'

import './App.css'
import CoinForm from './components/create/coin-form'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import { Providers } from './state/Providers'

const config = getDefaultConfig({
  appName: 'Pump Rand',
  projectId: '21fef48091f12692cad574a6f7753643',
  chains: [sanvil],
  ssr: true,
})

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Providers config={config}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CoinForm />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Providers>
    </BrowserRouter>
  )
}

export default App
