import { X } from 'lucide-react'
import { Fragment } from 'react'

import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from '@headlessui/react'

interface HOFInfoProps {
  isOpen: boolean
  onClose: () => void
}

const HOFInfo: React.FC<HOFInfoProps> = ({ isOpen, onClose }) => {
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
                  Hall of Fame
                </DialogTitle>

                <div className="text-[var(--creamWhite)] mb-6 space-y-4">
                  <p className="text-center">
                    The Hall of Fame showcases all graduated coins that have
                    successfully reached the required market cap.
                  </p>

                  <p className="text-center">
                    When a coin graduates, 1 testETH and 1 billion tokens are
                    deposited into the DEX, creating a liquid trading pair that
                    allows for direct trading on the open market.
                  </p>

                  <p className="text-center">
                    Graduated coins have achieved their funding goal and are now
                    freely tradable on the DEX.
                  </p>
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={onClose}
                    className="bg-[var(--midBlue)] hover:bg-blue-700 text-[var(--creamWhite)] font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Got it
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}

export default HOFInfo
