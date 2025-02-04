import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import HowItWorks from '../how-it-works'
import { usePersistentState } from '../storage/persistent-state'

const NavBar: React.FC = () => {
  const navigate = useNavigate()

  const { acceptedTerms } = usePersistentState()
  const [showHowItWorks, setShowHowItWorks] = useState(!acceptedTerms())

  const onConnectWallet = () => {
    console.log('Open Wallet Connector')
  }

  return (
    <>
      <nav className="w-full bg-white shadow-md py-4 px-8 flex justify-center space-x-8 text-lg font-medium text-gray-700">
        <button
          onClick={() => setShowHowItWorks(true)}
          className="hover:text-blue-600 transition"
        >
          How it Works
        </button>
        <button
          onClick={() => navigate('/create')}
          className="hover:text-blue-600 transition"
        >
          New Coin
        </button>
        <button
          onClick={onConnectWallet}
          className="hover:text-blue-600 transition"
        >
          Connect Wallet
        </button>
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
