import { useMemo, useState } from 'react'
import SwipeableViews from 'react-swipeable-views'
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
  handleBuy: (amount: string, tradeType: 'buy' | 'sell') => void
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
  // For BUY orders we use the parent's buyAmount,
  // for SELL orders we use a local sellAmount.
  const [sellAmount, setSellAmount] = useState('')
  // swipeIndex 0 is Buy; 1 is Sell.
  const [swipeIndex, setSwipeIndex] = useState(0)

  // Determine tradeType from swipeIndex.
  const tradeType = swipeIndex === 0 ? 'buy' : 'sell'

  // Dummy conversion rate: 1 ETH = 1000 Coin X
  const conversionRate = 1000

  // Estimated value for BUY mode: multiply ETH by conversion rate.
  const estimatedBuy = useMemo(() => {
    const inputValue = parseFloat(buyAmount)
    return isNaN(inputValue) || inputValue <= 0
      ? 0
      : inputValue * conversionRate
  }, [buyAmount, conversionRate])

  // Estimated value for SELL mode: divide coin amount by conversion rate.
  const estimatedSell = useMemo(() => {
    const inputValue = parseFloat(sellAmount)
    return isNaN(inputValue) || inputValue <= 0
      ? 0
      : inputValue / conversionRate
  }, [sellAmount, conversionRate])

  const handleViewBalance = () => {
    if (!isBalanceVisible) {
      setIsBalanceVisible(true)
      viewEthIn()
    }
  }

  return (
    <div className="flex flex-col items-center w-full">
      <Box
        sx={{
          marginBottom: 4,
          width: { xs: '300px', sm: '450px' },
        }}
      >
        <div className="w-full flex flex-col items-center text-center gap-2">
          {/* Balance Display & Always-Visible Refresh */}
          <div className="text-[var(--creamWhite)]">BALANCE</div>
          <div className="flex items-center gap-2">
            <button
              className="w-full text-[var(--creamWhite)]"
              onClick={handleViewBalance}
            >
              ({weiIn ? formatEther(weiIn) : 0})
            </button>
            <button
              className="bg-[var(--midBlue)] text-[var(--creamWhite)] py-2 px-4 rounded flex items-center"
              onClick={refreshWeiIn}
            >
              <CachedIcon />
            </button>
          </div>
          {loadingEthIn && (
            <div className="text-gray-500 text-sm">Waiting...</div>
          )}
          {isBalanceVisible && !loadingEthIn && (
            <div className="text-green-600 font-bold">
              {weiIn !== null ? formatEther(weiIn) : 'No balance available'}
            </div>
          )}

          {/* Header Toggle for Trade Mode */}
          <div className="flex w-full mb-4">
            <button
              onClick={() => setSwipeIndex(0)}
              className={`flex-1 px-4 py-2 rounded-l text-center uppercase font-bold ${
                swipeIndex === 0
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-300 text-gray-700'
              }`}
            >
              Buy
            </button>
            {coin.graduated && (
              <button
                onClick={() => setSwipeIndex(1)}
                className={`flex-1 px-4 py-2 rounded-r text-center uppercase font-bold ${
                  swipeIndex === 1
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-300 text-gray-700'
                }`}
              >
                Sell
              </button>
            )}
          </div>

          {/* Swipeable Views for Trade Panels */}
          <SwipeableViews
            index={swipeIndex}
            onChangeIndex={(index) => setSwipeIndex(index)}
            enableMouseEvents
            containerStyle={{ width: '100%', marginBottom: '16px' }}
          >
            {/* BUY Panel */}
            <div className="p-4">
              <div className="text-[var(--creamWhite)] font-bold uppercase mb-2">
                Buy
              </div>
              <input
                type="text"
                value={buyAmount}
                onChange={(e) => setBuyAmount(e.target.value)}
                placeholder="Enter ETH amount"
                className="w-full p-2 bg-[var(--lightBlue)] text-center rounded mb-2 text-[var(--midBlue)]"
              />
              <div className="text-[var(--creamWhite)]">
                You will receive: {estimatedBuy} Coin X
              </div>
              {buyError && <p className="text-red-500 text-sm">{buyError}</p>}
              <button
                className="w-full px-4 py-2 rounded bg-green-500 text-white mt-2"
                onClick={() => handleBuy(buyAmount, 'buy')}
              >
                {`CONFIRM BUY FOR ${estimatedBuy} COIN X`}
              </button>
            </div>

            {/* SELL Panel */}
            {coin.graduated ? (
              <div className="p-4">
                <div className="text-[var(--creamWhite)] font-bold uppercase mb-2">
                  Sell
                </div>
                <input
                  type="text"
                  value={sellAmount}
                  onChange={(e) => setSellAmount(e.target.value)}
                  placeholder="Enter coin amount"
                  className="w-full p-2 bg-[var(--lightBlue)] text-center rounded mb-2 text-[var(--midBlue)]"
                />
                <div className="text-[var(--creamWhite)]">
                  You will get back: {estimatedSell} ETH
                </div>
                {buyError && <p className="text-red-500 text-sm">{buyError}</p>}
                <button
                  className="w-full px-4 py-2 rounded bg-red-500 text-white mt-2"
                  onClick={() => handleBuy(sellAmount, 'sell')}
                >
                  {`CONFIRM SELL FOR ${estimatedSell} ETH`}
                </button>
              </div>
            ) : (
              <div className="p-4">
                <p className="text-gray-400">Selling not available</p>
              </div>
            )}
          </SwipeableViews>
        </div>
      </Box>

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
  )
}
