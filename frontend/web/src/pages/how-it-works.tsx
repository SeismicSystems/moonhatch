import { X } from 'lucide-react'
import React, { Fragment } from 'react'

import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from '@headlessui/react'

import { useAppState } from '../state/app-state'

const Step: React.FC<React.PropsWithChildren<{ number: number }>> = ({
  number,
  children,
}) => (
  <div className="text-gray-200 text-sm sm:text-base mb-4">
    step {number}: {children}
  </div>
)

const Link: React.FC<React.PropsWithChildren<{ href: string }>> = ({
  href,
  children,
}) => (
  <a href={href} className="text-gray-200 hover:text-gray-300 underline">
    {children}
  </a>
)

const Description: React.FC = () => (
  <div className="text-center mb-6">
    <p className="text-gray-200 text-sm sm:text-base">
      pump ensures that all created tokens are safe to trade through a secure
      and battle-tested token launching system. each coin on pump is a{' '}
      <span className="text-green-400">fair-launch</span> with{' '}
      <span className="text-blue-400">no presale</span> and{' '}
      <span className="text-orange-400">no team allocation</span>.
    </p>
  </div>
)

const HowItWorks: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { acceptTerms } = useAppState()
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="bg-gray-900 rounded-lg w-full max-w-lg p-6 relative">
                <button
                  onClick={onClose}
                  className="absolute right-4 top-4 text-gray-400 hover:text-gray-300"
                >
                  <X size={20} />
                </button>

                <DialogTitle className="text-gray-200 text-xl mb-6 text-center">
                  how it works
                </DialogTitle>

                <Description />

                <div className="space-y-4 mb-6">
                  <Step number={1}>pick a coin that you like</Step>
                  <Step number={2}>buy the coin on the bonding curve</Step>
                  <Step number={3}>
                    sell at any time to lock in your profits or losses
                  </Step>
                  <Step number={4}>
                    when enough people buy on the bonding curve it reaches a
                    market cap of $100k
                  </Step>
                  <Step number={5}>
                    $17k of liquidity is then deposited in raydium and burned
                  </Step>
                </div>

                <div className="text-center text-sm mb-6">
                  <Link href="/privacy">privacy policy</Link>
                  {' | '}
                  <Link href="/terms">terms of service</Link>
                  {' | '}
                  <Link href="/fees">fees</Link>
                </div>

                <div className="text-center text-gray-400 text-sm mb-4">
                  by clicking this button you agree to the terms and conditions
                </div>

                <button
                  onClick={() => {
                    acceptTerms()
                    onClose()
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  I'm ready to pump
                </button>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}

export default HowItWorks
