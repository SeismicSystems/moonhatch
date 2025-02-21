import React from 'react'
import { useNavigate } from 'react-router-dom'

import { useAppState } from '@/hooks/useAppState'
import HomeIcon from '@mui/icons-material/Home'
import '@rainbow-me/rainbowkit/styles.css'

import MyStyledConnectButton from './MyStyledConnectButton'

const NavBar: React.FC = () => {
  const navigate = useNavigate()

  return (
    <>
      <nav className="w-auto bg-[var(--darkBlue)] shadow-md py-4 px-8 flex justify-between text-lg font-medium text-[var(--creamWhite)] ">
        <button
          onClick={() => navigate('/')}
          className="text-[var(--creamWhite)] hover:text-[var(--midBlue)] transition"
        >
          <HomeIcon
            sx={{
              fontSize: { xs: '20px', sm: '30px', md: '34px' },
            }}
          />
        </button>
        <h1 className="self-center md:text-2xl  lg:text-3xl">MOONHATCH</h1>
        <div className="w-[67px] rounded-3xl">
          <MyStyledConnectButton />
        </div>
      </nav>
    </>
  )
}

export default NavBar
