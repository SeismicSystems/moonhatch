import React from 'react'

import { ConnectButton } from '@rainbow-me/rainbowkit'

const WalletButton: React.FC<
  React.PropsWithChildren<
    { onClick: () => void } & React.HTMLAttributes<HTMLButtonElement>
  >
> = ({ children, onClick, ...props }) => {
  return (
    <button
      onClick={onClick}
      className="text-base py-2 px-4 bg-[var(--midBlue)] text-[var(--creamWhite)] border rounded-2xl hover:bg-[var(--darkBlue)] transition whitespace-nowrap"
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
              Connect Wallet
            </WalletButton>
          )
        }
        if (chain?.unsupported) {
          return (
            <WalletButton onClick={openChainModal}>
              Unsupported chain
            </WalletButton>
          )
        }
        return (
          <WalletButton onClick={openAccountModal}>
            {account.displayName}
          </WalletButton>
        )
      }}
    </ConnectButton.Custom>
  )
}

export default WalletConnectButton
