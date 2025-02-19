import { useEffect, useMemo, useState } from 'react'
import { useSwipeable } from 'react-swipeable'

import { Box, Modal } from '@mui/material'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'

import { Coin } from '../../types/coin'

interface TransactionGraduatedProps {
  coin: Pick<Coin, 'id' | 'graduated' | 'name'>
  buyAmount: string
  setBuyAmount: (value: string) => void
  buyError: string | null
  handleBuy: (amount: string, tradeType: 'buy' | 'sell') => void
  modalOpen: boolean
  modalMessage: string
  setModalOpen: (open: boolean) => void
}

export default function TransactionGraduated({
  coin,
  buyAmount,
  setBuyAmount,
  buyError,
  handleBuy,
  modalOpen,
  modalMessage,
  setModalOpen,
}: TransactionGraduatedProps) {
  // For BUY orders, use parent's buyAmount; for SELL orders, use local state.
  const [sellAmount, setSellAmount] = useState('')
  // Default trade type is 'buy'
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy')

  // Dummy conversion rate: 1 ETH = 1000 Coin X
  const conversionRate = 1000

  // Estimated value for BUY
  const estimatedBuy = useMemo(() => {
    const inputValue = parseFloat(buyAmount)
    return isNaN(inputValue) || inputValue <= 0
      ? 0
      : inputValue * conversionRate
  }, [buyAmount, conversionRate])

  // Estimated value for SELL
  const estimatedSell = useMemo(() => {
    const inputValue = parseFloat(sellAmount)
    return isNaN(inputValue) || inputValue <= 0
      ? 0
      : inputValue / conversionRate
  }, [sellAmount, conversionRate])

  // When trade type changes, optionally reset the corresponding input
  useEffect(() => {
    if (tradeType === 'sell') {
      setSellAmount('')
    }
  }, [tradeType])

  // Swipe handlers for the toggle area
  const toggleSwipeHandlers = useSwipeable({
    onSwipedLeft: () => setTradeType('sell'),
    onSwipedRight: () => setTradeType('buy'),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  })

  return (
    <Box sx={{ width: { xs: '300px', sm: '450px' }, mx: 'auto', p: 4 }}>
      <div className="flex flex-col items-center text-center gap-2">
        {/* Stylized Trade Mode Toggle with Swipe */}
        <div {...toggleSwipeHandlers} className="w-full mb-4">
          <ToggleButtonGroup
            exclusive
            value={tradeType}
            onChange={(_, newValue) => {
              if (newValue !== null) setTradeType(newValue)
            }}
            sx={{
              backgroundColor: 'var(--lightBlue)',
              borderRadius: '9999px',
              padding: '4px',
              width: '100%',
            }}
          >
            <ToggleButton
              value="buy"
              sx={{
                flex: 1,
                border: 'none',
                borderRadius: '9999px',
                textTransform: 'uppercase',
                fontWeight: 'bold',
                color: tradeType === 'buy' ? 'white' : 'gray',
                backgroundColor: tradeType === 'buy' ? 'green' : 'transparent',
                '&:hover': {
                  backgroundColor:
                    tradeType === 'buy' ? 'darkgreen' : 'rgba(0,0,0,0.1)',
                },
              }}
            >
              Buy
            </ToggleButton>
            <ToggleButton
              value="sell"
              sx={{
                flex: 1,
                border: 'none',
                borderRadius: '9999px',
                textTransform: 'uppercase',
                fontWeight: 'bold',
                color: tradeType === 'sell' ? 'white' : 'gray',
                backgroundColor: tradeType === 'sell' ? 'red' : 'transparent',
                '&:hover': {
                  backgroundColor:
                    tradeType === 'sell' ? 'darkred' : 'rgba(0,0,0,0.1)',
                },
              }}
            >
              Sell
            </ToggleButton>
          </ToggleButtonGroup>
        </div>

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
            <div className="text-[var(--creamWhite)]"></div>
            {buyError && <p className="text-red-500 text-sm">{buyError}</p>}
            <button
              className="w-full px-4 py-2 rounded bg-green-500 text-white"
              onClick={() => handleBuy(buyAmount, 'buy')}
            >
              {`CONFIRM BUY FOR ${estimatedBuy} ${coin.name.toUpperCase()}`}
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
            <div className="text-[var(--creamWhite)]"></div>
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
    </Box>
  )
}
