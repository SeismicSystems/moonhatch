import { useMemo, useState } from 'react'
import { useSwipeable } from 'react-swipeable'
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
  // tradeType: either 'buy' or 'sell' (or null if not yet selected)
  const [tradeType, setTradeType] = useState<'buy' | 'sell' | null>(null)
  // Use parent's buyAmount for BUY orders and local state for SELL orders.
  const [sellAmount, setSellAmount] = useState('')

  // Dummy conversion rate: 1 ETH = 1000 Coin X
  const conversionRate = 1000

  // For BUY mode: use parent's buyAmount
  const estimatedBuy = useMemo(() => {
    const inputValue = parseFloat(buyAmount)
    return isNaN(inputValue) || inputValue <= 0
      ? 0
      : inputValue * conversionRate
  }, [buyAmount, conversionRate])

  // For SELL mode: use local sellAmount
  const estimatedSell = useMemo(() => {
    const inputValue = parseFloat(sellAmount)
    return isNaN(inputValue) || inputValue <= 0
      ? 0
      : inputValue / conversionRate
  }, [sellAmount, conversionRate])

  // Handle switching trade type and resetting the appropriate input fields
  const handleTrade = (type: 'buy' | 'sell') => {
    setTradeType(type)
    if (type === 'buy') {
      setBuyAmount('')
    } else {
      setSellAmount('')
    }
  }

  // Swipe configuration using react-swipeable
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      if (coin.graduated) {
        setTradeType('sell')
        setSellAmount('')
      }
    },
    onSwipedRight: () => {
      setTradeType('buy')
      setBuyAmount('')
    },
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  })

  const handleViewBalance = () => {
    if (!isBalanceVisible) {
      setIsBalanceVisible(true)
      viewEthIn()
    }
  }

  return (
    <div {...swipeHandlers} className="flex flex-col items-center w-full">
      <Box
        sx={{
          marginBottom: 4,
          width: { xs: '300px', sm: '450px' },
        }}
      >
        <div className="w-full flex flex-col items-center text-center gap-2">
          {/* Balance Display & Refresh Section */}
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

          {/* Trade Mode Toggle */}
          {!tradeType && (
            <div className="flex justify-center gap-4 w-full mb-4">
              <button
                className={`w-full px-4 py-2 rounded ${
                  tradeType === 'buy'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-700 text-gray-300'
                }`}
                onClick={() => handleTrade('buy')}
              >
                BUY
              </button>
              {coin.graduated && (
                <button
                  className={`w-full px-4 py-2 rounded ${
                    tradeType === 'sell'
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-700 text-gray-300'
                  }`}
                  onClick={() => handleTrade('sell')}
                >
                  SELL
                </button>
              )}
            </div>
          )}

          {/* Input and estimated value */}
          {tradeType === 'buy' && (
            <>
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
                className="w-full px-4 py-2 rounded bg-green-500 text-white"
                onClick={() => handleBuy(buyAmount, 'buy')}
              >
                {`CONFIRM BUY FOR ${estimatedBuy} COIN X`}
              </button>
            </>
          )}
          {tradeType === 'sell' && (
            <>
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
                className="w-full px-4 py-2 rounded bg-red-500 text-white"
                onClick={() => handleBuy(sellAmount, 'sell')}
              >
                {`CONFIRM SELL FOR ${estimatedSell} ETH`}
              </button>
            </>
          )}
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
