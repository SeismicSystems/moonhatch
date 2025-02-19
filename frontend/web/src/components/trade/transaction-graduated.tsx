import { useEffect, useMemo, useState } from 'react'

import { Box, Modal } from '@mui/material'

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

  // Estimated value for BUY: parent's buyAmount * conversionRate
  const estimatedBuy = useMemo(() => {
    const inputValue = parseFloat(buyAmount)
    return isNaN(inputValue) || inputValue <= 0
      ? 0
      : inputValue * conversionRate
  }, [buyAmount, conversionRate])

  // Estimated value for SELL: local sellAmount / conversionRate
  const estimatedSell = useMemo(() => {
    const inputValue = parseFloat(sellAmount)
    return isNaN(inputValue) || inputValue <= 0
      ? 0
      : inputValue / conversionRate
  }, [sellAmount, conversionRate])

  // Optionally reset input for SELL when tradeType changes
  useEffect(() => {
    if (tradeType === 'sell') {
      setSellAmount('')
    }
  }, [tradeType])

  // Custom styles for the toggle buttons
  const toggleContainerStyle: React.CSSProperties = {
    display: 'flex',
    width: '100%',
    borderRadius: '9999px',
    overflow: 'hidden',
  }

  const toggleButtonStyle = (
    active: boolean,
    activeBg: string,
    inactiveBg: string
  ): React.CSSProperties => ({
    flex: 1,
    padding: '10px 0',
    border: 'none',
    cursor: 'pointer',
    backgroundColor: active ? activeBg : inactiveBg,
    color: active ? 'white' : 'gray',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  })

  return (
    <Box sx={{ width: { xs: '300px', sm: '450px' }, mx: 'auto', p: 4 }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        {/* Custom Toggle */}
        <div style={toggleContainerStyle}>
          <button
            style={toggleButtonStyle(tradeType === 'buy', 'green', '#e0e0e0')}
            onClick={() => setTradeType('buy')}
          >
            Buy
          </button>
          <button
            style={toggleButtonStyle(tradeType === 'sell', 'red', '#e0e0e0')}
            onClick={() => setTradeType('sell')}
          >
            Sell
          </button>
        </div>

        {/* Trade Input and Confirm Button */}
        {tradeType === 'buy' && (
          <>
            <input
              type="text"
              value={buyAmount}
              onChange={(e) => setBuyAmount(e.target.value)}
              placeholder="Enter ETH amount"
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                textAlign: 'center',
                border: '1px solid #ccc',
              }}
            />
            <div style={{ color: '#fff' }}>
              You will receive: {estimatedBuy} {coin.name.toUpperCase()}
            </div>
            {buyError && <p style={{ color: 'red' }}>{buyError}</p>}
            <button
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: 'green',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
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
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                textAlign: 'center',
                border: '1px solid #ccc',
              }}
            />
            <div style={{ color: '#fff' }}>
              You will get back: {estimatedSell} ETH
            </div>
            {buyError && <p style={{ color: 'red' }}>{buyError}</p>}
            <button
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: 'red',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
              onClick={() => handleBuy(sellAmount, 'sell')}
            >
              {`CONFIRM SELL FOR ${estimatedSell} ETH`}
            </button>
          </>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Box
          sx={{
            p: 4,
            bgcolor: 'white',
            border: '1px solid',
            borderRadius: 2,
            textAlign: 'center',
          }}
        >
          <h2 style={{ fontWeight: 'bold' }}>Warning</h2>
          <p>{modalMessage}</p>
          <button
            style={{
              backgroundColor: 'blue',
              color: 'white',
              padding: '8px 16px',
              border: 'none',
              borderRadius: '4px',
              marginTop: '16px',
              cursor: 'pointer',
            }}
            onClick={() => setModalOpen(false)}
          >
            OK
          </button>
        </Box>
      </Modal>
    </Box>
  )
}
