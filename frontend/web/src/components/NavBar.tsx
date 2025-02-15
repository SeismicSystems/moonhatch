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
      <nav className="w-full bg-[var(--darkBlue)] shadow-md py-4 px-8 flex justify-between text-lg font-medium text-[var(--creamWhite)]">
        <button
          onClick={() => setShowHowItWorks(true)}
          className="hover:text-blue-600 transition"
        >
          <HelpIcon />
        </button>
        <div className="self-center">UNPREDICTA-PUMP</div>
        <div className="w-[67px] rounded-3xl">
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
