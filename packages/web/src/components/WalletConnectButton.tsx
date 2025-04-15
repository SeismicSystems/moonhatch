import React from 'react'

import { ConnectButton } from '@rainbow-me/rainbowkit'

// Wallet icon component using SVG for better quality
const WalletIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-5 h-5"
  >
    <path d="M2.273 5.625A4.483 4.483 0 0 1 5.25 4.5h13.5c1.141 0 2.183.425 2.977 1.125A3 3 0 0 0 18.75 3H5.25a3 3 0 0 0-2.977 2.625ZM2.273 8.625A4.483 4.483 0 0 1 5.25 7.5h13.5c1.141 0 2.183.425 2.977 1.125A3 3 0 0 0 18.75 6H5.25a3 3 0 0 0-2.977 2.625ZM5.25 9a3 3 0 0 0-3 3v6a3 3 0 0 0 3 3h13.5a3 3 0 0 0 3-3v-6a3 3 0 0 0-3-3H15a.75.75 0 0 0-.75.75 2.25 2.25 0 0 1-4.5 0A.75.75 0 0 0 9 9H5.25Z" />
  </svg>
)

const WalletButton: React.FC<
  React.PropsWithChildren<
    { onClick: () => void } & React.HTMLAttributes<HTMLButtonElement>
  >
> = ({ children, onClick, ...props }) => {
  return (
    <button
      onClick={onClick}
      className="md:text-base md:py-2 md:px-4 md:rounded-2xl md:whitespace-nowrap bg-[var(--midBlue)] text-[var(--creamWhite)] border hover:bg-[var(--darkBlue)] transition p-2 aspect-square rounded-lg sm:px-3 sm:py-1.5 sm:aspect-auto"
      {...props}
    >
      {children}
    </button>
  )
}

const WalletConnectButton = () => {
  return (
    <ConnectButton.Custom>
      {({
        account,
        openConnectModal,
        chain,
        openAccountModal,
        openChainModal,
        mounted,
        authenticationStatus,
      }) => {
        if (!mounted || authenticationStatus === 'loading') {
          return <></>
        }
        if (!account || authenticationStatus === 'unauthenticated') {
          return (
            <WalletButton onClick={openConnectModal}>
              <span className="md:inline hidden">Connect Wallet</span>
              <span className="md:hidden">
                <WalletIcon />
              </span>
            </WalletButton>
          )
        }
        if (chain?.unsupported) {
          return (
            <WalletButton onClick={openChainModal}>
              <span className="md:inline hidden">Unsupported chain</span>
              <span className="md:hidden">
                <WalletIcon />
              </span>
            </WalletButton>
          )
        }
        return (
          <WalletButton onClick={openAccountModal}>
            <span className="md:inline hidden">{account.displayName}</span>
            <span className="md:hidden">
              <WalletIcon />
            </span>
          </WalletButton>
        )
      }}
    </ConnectButton.Custom>
  )
}

export default WalletConnectButton
