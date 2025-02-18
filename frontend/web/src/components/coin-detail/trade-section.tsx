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
  buyError,
  handleBuy,
  modalOpen,
  modalMessage,
  setModalOpen,
}: TradeSectionProps) {
  const [isBalanceVisible, setIsBalanceVisible] = useState(false)
  const [tradeType, setTradeType] = useState<'buy' | 'sell' | null>(null)
  const [amount, setAmount] = useState('')

  // Dummy conversion rate: 1 ETH = 1000 Coin X, and vice versa.
  const conversionRate = 1000

  // Calculate the estimated amount dynamically
  const estimatedAmount = useMemo(() => {
    const inputValue = parseFloat(amount)
    if (isNaN(inputValue) || inputValue <= 0) return 0
    return tradeType === 'buy'
      ? inputValue * conversionRate // ETH → Coin X
      : inputValue / conversionRate // Coin X → ETH
  }, [amount, tradeType])

  // Handle switching the trade type and resetting the amount
  const handleTrade = (type: 'buy' | 'sell') => {
    setTradeType(type)
    setAmount('')
  }

  // Swipe configuration using react-swipeable
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      if (coin.graduated) {
        setTradeType('sell')
        setAmount('')
      }
    },
    onSwipedRight: () => {
      setTradeType('buy')
      setAmount('')
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
          <div className="text-[var(--creamWhite)]">BALANCE</div>
          <button
            className="w-full mb-2 text-[var(--creamWhite)]"
            onClick={() => console.log('View Balance (0)')}
          >
            ({weiIn ? formatEther(weiIn) : 0})
          </button>

          {/* Display current mode from swipe gestures or button click */}
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

          {/* Input and estimated value are displayed only after selecting a trade mode */}
          {tradeType && (
            <>
              <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={
                  tradeType === 'buy' ? 'Enter ETH amount' : 'Enter coin amount'
                }
                className="w-full p-2 bg-[var(--lightBlue)] text-center rounded mb-2 text-[var(--midBlue)]"
              />
              <div className="text-[var(--creamWhite)]">
                {tradeType === 'buy'
                  ? `You will receive: ${estimatedAmount} Coin X`
                  : `You will get back: ${estimatedAmount} ETH`}
              </div>
              {buyError && <p className="text-red-500 text-sm">{buyError}</p>}
              <button
                className={`w-full px-4 py-2 rounded ${
                  tradeType === 'buy' ? 'bg-green-500' : 'bg-red-500'
                } text-white`}
                onClick={() => handleBuy(amount, tradeType)}
              >
                {tradeType === 'buy' ? 'CONFIRM BUY' : 'CONFIRM SELL'}
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
