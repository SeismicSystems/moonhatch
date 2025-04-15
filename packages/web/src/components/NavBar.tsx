import React, { useState } from 'react'

import WalletConnectButton from '@/components/WalletConnectButton'
import FaucetLink from '@/components/links/FaucetLink'
import HallOfFameLink from '@/components/links/HallOfFameLink'
import HomeLink from '@/components/links/HomeLink'
import '@rainbow-me/rainbowkit/styles.css'

const ICON_BACKGROUND_COLOR = '#f7fbfd20'
const ICON_STYLE = {
  backgroundColor: ICON_BACKGROUND_COLOR,
  borderRadius: '4px',
  padding: '4px 8px',
}

const NavBar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  return (
    <nav className="w-full bg-[var(--darkBlue)] shadow-md py-4 px-8 flex items-center justify-between text-lg font-medium text-[var(--creamWhite)]">
      {/* Hamburger menu button for mobile */}
      <div className="md:hidden z-50">
        <button
          onClick={toggleMobileMenu}
          className="flex flex-col justify-center items-center w-8 h-8"
          aria-label="Toggle menu"
        >
          <span
            className={`block h-0.5 w-6 bg-[var(--creamWhite)] transition-transform duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-1' : ''}`}
          ></span>
          <span
            className={`block h-0.5 w-6 bg-[var(--creamWhite)] my-1 ${mobileMenuOpen ? 'opacity-0' : ''}`}
          ></span>
          <span
            className={`block h-0.5 w-6 bg-[var(--creamWhite)] transition-transform duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-1' : ''}`}
          ></span>
        </button>
      </div>

      {/* Desktop navigation links */}
      <div className="hidden md:flex items-center justify-center w-32 pr-16 pl-4 gap-4">
        <HomeLink style={ICON_STYLE} />
        <FaucetLink style={ICON_STYLE} />
        <HallOfFameLink style={ICON_STYLE} />
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="absolute top-16 left-0 w-full bg-[var(--darkBlue)] shadow-md z-50 p-4 md:hidden">
          <div className="flex flex-col space-y-4">
            <HomeLink style={ICON_STYLE} />
            <FaucetLink style={ICON_STYLE} />
            <HallOfFameLink style={ICON_STYLE} />
          </div>
        </div>
      )}

      <h1 className="text-center md:text-2xl lg:text-3xl flex-1">MOONHATCH</h1>
      <div className="flex items-center justify-end">
        <WalletConnectButton />
      </div>
    </nav>
  )
}

export default NavBar
