import { X } from 'lucide-react'
import React, { Fragment } from 'react'

import { Address } from '@/components/address/address'
import { useAppState } from '@/hooks/useAppState'
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from '@headlessui/react'

const Step: React.FC<
  React.PropsWithChildren<{ number: number; style?: React.CSSProperties }>
> = ({ number, style, children }) => (
  <div
    className="text-[var(--creamWhite)]  text-sm sm:text-base mb-4"
    style={style}
  >
    step {number}: {children}
  </div>
)

const Description: React.FC = () => (
  <div className="flex flex-col gap-2 text-center mb-6">
    <p className="text-[var(--creamWhite)] text-sm sm:text-base">
      <span className="text-blue-400">moonhatch</span> is a seismic spin on
      pump.fun.
    </p>
    <p className="text-[var(--creamWhite)] text-sm sm:text-base">
      buyers receive a
      <span className="text-orange-400"> randomly generated price </span>and
      <br />
      <span className="text-pink-300"> no one can see </span>how much anyone has
      spent on a coin
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
              <DialogPanel className="bg-[var(--darkBlue)] rounded-lg w-full max-w-lg p-6 relative">
                <button
                  onClick={onClose}
                  className="absolute right-4 top-4 text-gray-400 hover:text-gray-300"
                >
                  <X size={20} />
                </button>

                <DialogTitle className="text-[var(--creamWhite)] text-xl mb-6 text-center">
                  how it works
                </DialogTitle>

                <Description />

                <div className="space-y-4 mb-6">
                  <Step number={1}>
                    pick a coin that you like or create a new one. the supply of
                    all coins is 2 billion tokens
                  </Step>
                  <Step number={2}>
                    buy it. the average price across all buys will be 1b tokens
                    for 1 testETH
                  </Step>
                  <Step number={3}>
                    when enough people buy on the bonding curve it reaches a
                    market cap of 2 testETH
                  </Step>
                  <Step number={4}>
                    1 testETH and 1b tokens are deposited into the dex
                  </Step>
                  <Step number={5} style={{ display: 'flex', gap: '4px' }}>
                    the LP tokens are burned to
                    <Address
                      style={{ color: 'var(--color-blue-200)' }}
                      address="0x000000000000000000000000000000000000dEaD"
                    />
                  </Step>
                  <Step number={6}>
                    you can only see your allocation after graduation
                  </Step>
                </div>
                <div className="text-center text-gray-400 text-sm mb-4">
                  by clicking this button you agree to the terms and conditions
                  <p>(there are no terms and conditions)</p>
                </div>

                <button
                  onClick={() => {
                    acceptTerms()
                    onClose()
                  }}
                  className="w-full bg-[var(--midBlue)] hover:bg-blue-700 text-[var(--creamWhite)] font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  i'm ready to hatch
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
