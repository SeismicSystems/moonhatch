import React from 'react'
import { useNavigate } from 'react-router-dom'

import { useAppState } from '@/hooks/useAppState'
import HomeIcon from '@mui/icons-material/Home'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'

import MyStyledConnectButton from './MyStyledConnectButton'

const NavBar: React.FC = () => {
  const navigate = useNavigate()

  return (
    <>
      <nav className="w-auto bg-[var(--darkBlue)] shadow-md py-4 px-8 flex justify-between text-lg font-medium text-[var(--creamWhite)] ">
        <button
          onClick={() => navigate('/')}
          className="hover:text-blue-600 transition"
        >
          <HomeIcon />
        </button>
        <div className="self-center">UNPREDICTA-PUMP</div>
        <div className="w-[67px] rounded-3xl">
          <MyStyledConnectButton />
          {/* <ConnectButton /> */}
        </div>
      </nav>
    </>
  )
}

export default NavBar
