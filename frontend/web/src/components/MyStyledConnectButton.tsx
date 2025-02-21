import { ConnectButton } from '@rainbow-me/rainbowkit'

const MyStyledConnectButton = () => {
  return (
    <div className="w-[10px] rounded-3xl">
      <ConnectButton.Custom>
        {({
          account,
          // @ts-expect-error this is fine
          chain,
          openConnectModal,
          // @ts-expect-error this is fine
          openAccountModal,
          // @ts-expect-error this is fine
          openChainModal,
          // @ts-expect-error this is fine
          mounted,
          // @ts-expect-error this is fine
          authenticationStatus,
        }) => {
          return (
            <button
              onClick={openConnectModal}
              className="text-base py-2 px-2 bg-[var(--midBlue)] text-[var(--creamWhite)]  border rounded hover:bg-[var(--darkBlue)] transition rounded-2xl"
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
