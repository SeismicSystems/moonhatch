import React from 'react'
import { useNavigate } from 'react-router-dom'

// @ts-expect-error this is fine
import { useAppState } from '@/hooks/useAppState'
import HomeIcon from '@mui/icons-material/Home'
import '@rainbow-me/rainbowkit/styles.css'

import MyStyledConnectButton from './MyStyledConnectButton'

const NavBar: React.FC = () => {
  const navigate = useNavigate()

  return (
    <>
      <nav className="w-auto bg-[var(--darkBlue)] shadow-md py-4 px-8 flex items-center justify-between text-lg font-medium text-[var(--creamWhite)]">
        <div className="w-16">
          <button
            onClick={() => navigate('/')}
            className="text-[var(--creamWhite)] hover:text-[var(--midBlue)] transition"
          >
            <HomeIcon
              sx={{
                fontSize: { xs: '20px', sm: '30px', md: '34px' },
                marginRight: '5rem',
              }}
            />
          </button>
        </div>
        <h1 className="text-center md:text-2xl lg:text-3xl flex-1">
          MOONHATCH
        </h1>
        <div className="w-16">
          <MyStyledConnectButton />
        </div>
      </nav>
    </>
  )
}

export default NavBar
