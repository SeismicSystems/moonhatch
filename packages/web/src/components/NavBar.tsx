import React from 'react'

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
  return (
    <nav className="w-full bg-[var(--darkBlue)] shadow-md py-4 px-8 flex items-center justify-between text-lg font-medium text-[var(--creamWhite)]">
      <div className="flex items-center justify-center w-32 pr-16 pl-4 gap-4">
        <HomeLink style={ICON_STYLE} />
        <FaucetLink style={ICON_STYLE} />
        <HallOfFameLink style={ICON_STYLE} />
      </div>
      <h1 className="text-center md:text-2xl lg:text-3xl flex-1">MOONHATCH</h1>
      <div className="flex items-center justify-end w-32">
        <WalletConnectButton />
      </div>
    </nav>
  )
}

export default NavBar
