import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { sanvil } from 'seismic-react'

import { getDefaultConfig } from '@rainbow-me/rainbowkit'

import './App.css'
import Home from './Home'
import { Providers } from './Providers'
import CoinForm from './create/coin-form'
import NotFound from './pages/NotFound'

const config = getDefaultConfig({
  appName: 'Pump Rand',
  projectId: 'SEISMIC_PUMP_RAND',
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
