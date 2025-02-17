import React from 'react'

import { ConnectButton } from '@rainbow-me/rainbowkit'

const MyStyledConnectButton = () => {
  return (
    <div className="w-[10px] rounded-3xl">
      <ConnectButton.Custom>
        {({
          account,
          chain,
          openConnectModal,
          openAccountModal,
          openChainModal,
          mounted,
          authenticationStatus,
        }) => {
          // You can use these props to customize your UI.
          return (
            <button
              onClick={openConnectModal}
              className="text-base py-2 px-2 bg-[var(--midBlue)] text-[var(--creamWhite)]  border rounded hover:bg-blue-600 transition rounded-2xl"
            >
              {account ? account.displayName : 'Connect Wallet'}
            </button>
          )
        }}
      </ConnectButton.Custom>
    </div>
  )
}

export default MyStyledConnectButton
