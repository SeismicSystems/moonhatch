import { motion } from 'framer-motion'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAppState } from '@/hooks/useAppState'
import HowItWorks from '@/pages/HowItWorks'
import HelpIcon from '@mui/icons-material/Help'

export default function HomeHeader() {
  const navigate = useNavigate()
  const { acceptedTerms } = useAppState()
  const [showHowItWorks, setShowHowItWorks] = useState(!acceptedTerms())

  return (
    <div className="grid grid-cols-3 items-center w-full px-4">
      {/* Left section: Help Icon */}
      <button
        onClick={() => setShowHowItWorks(true)}
        className="text-[var(--creamWhite)]  ml-12 hover:text-blue-600 transition justify-self-start"
      >
        <HelpIcon />
      </button>

      {/* Center section: "CREATE COIN" button */}
      <motion.button
        animate={{
          backgroundColor: [
            '#161b33', // Base color
            '#00FF00', // Flicker 1: green
            '#161b33', // Back to base
            '#00FF00', // Flicker 2: green
            '#161b33', // Back to base
          ],
          color: ['#f1dac4', '#0d0c1d', '#f1dac4', '#0d0c1d', '#f1dac4'],
        }}
        transition={{
          duration: 4,
          times: [0, 0.2, 0.5, 0.8, 1],
          ease: [
            [0.445, 0.05, 0.55, 0.95],
            [0.445, 0.05, 0.55, 0.95],
            [0.445, 0.05, 0.55, 0.95],
            [0.445, 0.05, 0.55, 0.95],
          ],
        }}
        onClick={() => navigate('/create')}
        className="mt-6 w-[200px] max-w-xs text-[var(--creamWhite)] rounded-xl transition border px-2 text-xl whitespace-nowrap h-16 justify-self-center"
      >
        CREATE COIN
      </motion.button>

      {/* Right section: Empty placeholder to balance the grid */}
      <div className="justify-self-end flex-col flex text-[var(--creamWhite)]"></div>

      {showHowItWorks && (
        <HowItWorks
          isOpen={showHowItWorks}
          onClose={() => setShowHowItWorks(false)}
        />
      )}
    </div>
  )
}
