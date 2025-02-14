import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAppState } from '@/hooks/useAppState'
import HowItWorks from '@/pages/HowItWorks'
import HelpIcon from '@mui/icons-material/Help'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'

import MyStyledConnectButton from './MyStyledConnectButton'

const NavBar: React.FC = () => {
  const navigate = useNavigate()

  const { acceptedTerms } = useAppState()
  const [showHowItWorks, setShowHowItWorks] = useState(!acceptedTerms())

  return (
    <>
      <nav className="w-full bg-[var(--darkBlue)] shadow-md py-4 px-8 flex justify-center space-x-8 text-lg font-medium text-[var(--creamWhite)]">
        <button
          onClick={() => setShowHowItWorks(true)}
          className="hover:text-blue-600 transition"
        >
          <HelpIcon />
        </button>
        <button
          onClick={() => navigate('/create')}
          className="hover:text-blue-600 text-[var(--creamWhite)] rounded-xl  transition border px-2 bg-[var(--midBlue)] whitespace-nowrap"
        >
          CREATE COIN
        </button>
        <div className="w-[10px] rounded-3xl">
          <MyStyledConnectButton />
          {/* <ConnectButton /> */}
        </div>
      </nav>
      {showHowItWorks && (
        <HowItWorks
          isOpen={showHowItWorks}
          onClose={() => setShowHowItWorks(false)}
        />
      )}
    </>
  )
}

export default NavBar
