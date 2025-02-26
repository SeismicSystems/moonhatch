import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAppState } from '@/hooks/useAppState'
import HowItWorks from '@/pages/HowItWorks'
import HelpIcon from '@mui/icons-material/Help'

const CreateCoinButton: React.FC = () => {
  const { acceptedTerms } = useAppState()
  const [showHowItWorks, setShowHowItWorks] = useState(!acceptedTerms())
  const navigate = useNavigate()

  return (
    <>
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
      {showHowItWorks && (
        <HowItWorks
          isOpen={showHowItWorks}
          onClose={() => setShowHowItWorks(false)}
        />
      )}
    </>
  )
}

export default CreateCoinButton
