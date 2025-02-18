import { useState } from 'react'
import { formatEther } from 'viem'

import CachedIcon from '@mui/icons-material/Cached'
import VisibilityIcon from '@mui/icons-material/Visibility'
import { Box, Modal } from '@mui/material'

import { Coin } from '../../types/coin'

interface TradeSectionProps {
  coin: Pick<Coin, 'id' | 'graduated'>
  weiIn: bigint | null
  loadingEthIn: boolean
  viewEthIn: () => void
  refreshWeiIn: () => void
  buyAmount: string
  setBuyAmount: (value: string) => void
  buyError: string | null
  handleBuy: () => void
  modalOpen: boolean
  modalMessage: string
  setModalOpen: (open: boolean) => void
}

export default function TradeSection({
  coin,
  weiIn,
  loadingEthIn,
  viewEthIn,
  refreshWeiIn,
  buyAmount,
  setBuyAmount,
  buyError,
  handleBuy,
  modalOpen,
  modalMessage,
  setModalOpen,
}: TradeSectionProps) {
  const [isBalanceVisible, setIsBalanceVisible] = useState(false)

  // Called when the user clicks the VisibilityIcon button.
  // We set the state to true (so that CachedIcon remains visible)
  // and trigger the fetching of the balance.
  const handleViewBalance = () => {
    if (!isBalanceVisible) {
      setIsBalanceVisible(true)
      viewEthIn()
    }
  }

  return (
    <>
      <div className="flex justify-center gap-x-2 w-full items-center">
        <Box
          sx={{
            marginBottom: 4,
            height: '100px',
            width: { xs: '300px', sm: '450px' },
          }}
        >
          {coin.graduated ? (
            <div className="w-full   flex flex-col items-center text-center gap-2">
              <div className="text-[var(--creamWhite)]">BALANCE</div>
              <button
                className="w-full mb-2 text-[var(--creamWhite)]"
                onClick={() => console.log('View Balance (0)')}
              >
                ({weiIn ? formatEther(weiIn) : 0})
              </button>
              <input
                type="text"
                value={buyAmount} // need logic for sell
                onChange={(e) => setBuyAmount(e.target.value)}
                placeholder="Enter amount (max 1 ETH)"
                className="w-full p-2 bg-[var(--lightBlue)] text-center  rounded mb-2 text-[var(--midBlue)]"
              />
              {buyError && <p className="text-red-500 text-sm">{buyError}</p>}
              <div className="w-full flex items-center justify-center gap-2">
                <button
                  className="hover:bg-white hover:text-green-500 w-full bg-green-500 text-white px-4 py-2 rounded"
                  onClick={handleBuy}
                >
                  BUY
                </button>
                <button
                  className="w-full hover:bg-white hover:text-red-500 bg-red-500 text-white px-4 py-2 rounded"
                  onClick={handleBuy}
                >
                  SELL
                </button>
              </div>
            </div>
          ) : (
            // For non-graduated coins, handle visibility and refresh UI.
            <div className="flex flex-col  items-center">
              {/* When the balance is hidden and not loading, show the VisibilityIcon */}
              {!isBalanceVisible && !loadingEthIn && !coin.graduated && (
                <>
                  <div className="small-container flex flex-col items-center lg:hidden">
                    <div className="text-[var(--creamWhite)]">BALANCE</div>
                    <button
                      className="bg-[var(--midBlue)] text-[var(--creamWhite)] py-2 px-4 rounded flex items-center"
                      onClick={handleViewBalance}
                    >
                      <VisibilityIcon />
                    </button>
                  </div>
                  <div className="lg-container hidden lg:flex flex-col w-[400px] items-center space-y-2  ">
                    <button
                      className="w-full bg-[var(--midBlue)] text-[var(--creamWhite)] py-2 px-4 mt-4 rounded "
                      onClick={handleViewBalance}
                    >
                      VIEW BALANCE
                    </button>
                    <div className="trade flex flex-col w-[400px]  ">
                      <input
                        type="text"
                        value={buyAmount}
                        onChange={(e) => setBuyAmount(e.target.value)}
                        placeholder="Enter amount (max 1 ETH)"
                        className=" p-2 bg-[var(--lightBlue)] text-center rounded mb-2 text-[var(--midBlue)]"
                      />
                      {buyError && (
                        <p className="text-red-500 text-sm">{buyError}</p>
                      )}
                      <button
                        className="bg-green-500 text-white px-4 py-2 rounded"
                        onClick={handleBuy}
                      >
                        BUY
                      </button>
                    </div>
                  </div>
                </>
              )}
              {/* Show a waiting message if the balance is loading */}
              {loadingEthIn && (
                <div className="text-gray-500 text-sm">Waiting...</div>
              )}
              {/* Once the balance is visible (isBalanceVisible true) and not loading,
                  display the balance and the CachedIcon for refreshing */}
              {isBalanceVisible && !loadingEthIn && (
                <>
                  <div className="text-green-600 font-bold">
                    {weiIn !== null
                      ? formatEther(weiIn)
                      : 'No balance available'}
                  </div>
                  <button
                    className="bg-[var(--midBlue)] text-[var(--creamWhite)] py-2 px-4 rounded flex items-center mt-2"
                    onClick={refreshWeiIn}
                  >
                    <CachedIcon />
                  </button>
                </>
              )}
            </div>
          )}
        </Box>
        {!coin.graduated && (
          <div className="trade flex flex-col lg:hidden">
            <input
              type="text"
              value={buyAmount}
              onChange={(e) => setBuyAmount(e.target.value)}
              placeholder="Enter amount (max 1 ETH)"
              className=" p-2 bg-[var(--lightBlue)] rounded mb-2 text-[var(--midBlue)]"
            />
            {buyError && <p className="text-red-500 text-sm">{buyError}</p>}
            <button
              className="bg-green-500 text-white px-4 py-2 rounded"
              onClick={handleBuy}
            >
              BUY
            </button>
          </div>
        )}
        <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
          <Box className="p-4 bg-white border rounded shadow-lg text-center">
            <h2 className="text-lg font-bold">Warning</h2>
            <p>{modalMessage}</p>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
              onClick={() => setModalOpen(false)}
            >
              OK
            </button>
          </Box>
        </Modal>
      </div>
    </>
  )
}
