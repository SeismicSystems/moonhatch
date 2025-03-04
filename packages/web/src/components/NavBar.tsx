import React from 'react'
import { useNavigate } from 'react-router-dom'

import WalletConnectButton from '@/components/WalletConnectButton'
import HomeIcon from '@mui/icons-material/Home'
import '@rainbow-me/rainbowkit/styles.css'

const NavBar: React.FC = () => {
  const navigate = useNavigate()

  return (
    <nav className="w-full bg-[var(--darkBlue)] shadow-md py-4 px-8 flex items-center justify-between text-lg font-medium text-[var(--creamWhite)]">
      <div className="flex items-center justify-center w-8 pr-24">
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
      </div>
      <h1 className="text-center md:text-2xl lg:text-3xl flex-1">MOONHATCH</h1>
      <div className="flex items-center justify-end w-32">
        <WalletConnectButton />
      </div>
    </nav>
  )
}

export default NavBar
