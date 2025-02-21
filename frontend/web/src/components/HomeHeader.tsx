import { motion } from 'framer-motion'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAppState } from '@/hooks/useAppState'
import HowItWorks from '@/pages/HowItWorks'
import HelpIcon from '@mui/icons-material/Help'
import LockIcon from '@mui/icons-material/Lock'
import SchoolIcon from '@mui/icons-material/School'

import KingOfTheHillSection from './home/king-of-the-hill'

export default function HomeHeader() {
  const navigate = useNavigate()
  const { acceptedTerms } = useAppState()
  const [showHowItWorks, setShowHowItWorks] = useState(!acceptedTerms())

  return (
    <>
      <div className="flex flex-col   items-center w-full px-4">
        <button
          onClick={() => setShowHowItWorks(true)}
          className="text-orange-300 md:mr-72 lg:mr-96  -mb-15  mr-48  z-50  hover:text-blue-600 transition justify-self-start "
        >
          <HelpIcon
            sx={{
              fontSize: { xs: '20px', sm: '30px', md: '34px' },
            }}
          />
        </button>
        <button
          onClick={() => navigate('/create')}
          className=" w-[200px] md:w-[300px]  mt-12 lg:w-[400px] max-w-3xl lg:mt-12 text-[var(--creamWhite)] rounded-xl transition border px-2 text-xl md:text-2xl lg:text-3xl whitespace-nowrap h-16 md:h-20 lg:h-28 justify-self-center bg-[#161b33] hover:bg-green-500 hover:text-[#0d0c1d] "
        >
          CREATE COIN
        </button>
        <KingOfTheHillSection />
        {/* Right section: Empty placeholder to balance the grid */}

        {showHowItWorks && (
          <HowItWorks
            isOpen={showHowItWorks}
            onClose={() => setShowHowItWorks(false)}
          />
        )}
      </div>
      <div className="justify-self-end  lg:mt-2 flex-col flex text-[var(--creamWhite)]"></div>
      <div className="flex grad-icons-container gap-2 justify-center ">
        <div className="flex items-center">
          <LockIcon
            className="lock-icon text-red-500 mx-1"
            sx={{
              fontSize: { xs: '20px', sm: '24px', md: '24px', lg: '30px' },
            }}
          />
          <p className="text-[10px] md:text-[12px] lg:text-[14px] text-[var(--creamWhite)]">
            = not graduated to raydium
          </p>
        </div>
        <div className="flex items-center">
          <SchoolIcon
            className="lock-icon text-green-500 mx-1 "
            sx={{
              fontSize: { xs: '20px', sm: '24px', md: '24px', lg: '30px' },
            }}
          />
          <p className="text-[10px] md:text-[12px] lg:text-[14px] text-[var(--creamWhite)]">
            = graduated to raydium
          </p>
        </div>
      </div>
    </>
  )
}
