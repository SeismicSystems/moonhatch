import { useMemo } from 'react'

import { Box, Modal } from '@mui/material'

import { Coin } from '../../types/coin'

interface TransactionNonGraduatedProps {
  coin: Pick<Coin, 'id' | 'name'>
  buyAmount: string
  setBuyAmount: (value: string) => void
  buyError: string | null
  handleBuy: (amount: string, tradeType: 'buy') => void
  modalOpen: boolean
  modalMessage: string
  setModalOpen: (open: boolean) => void
}

export default function TransactionNonGraduated({
  coin,
  buyAmount,
  setBuyAmount,
  buyError,
  handleBuy,
  modalOpen,
  modalMessage,
  setModalOpen,
}: TransactionNonGraduatedProps) {
  const conversionRate = 1000

  const estimatedBuy = useMemo(() => {
    const inputValue = parseFloat(buyAmount)
    return isNaN(inputValue) || inputValue <= 0
      ? 0
      : inputValue * conversionRate
  }, [buyAmount, conversionRate])

  return (
    <Box
      sx={{
        width: { xs: '300px', sm: '450px' },
        mx: 'auto',
        paddingBottom: { xs: 2, sm: 2, md: 0, lg: 2, xl: 2 },
        marginBottom: { xs: 2, sm: 2, md: 0, lg: 2, xl: 2 },
      }}
    >
      <Box
        style={{
          height: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        <input
          type="text"
          value={buyAmount}
          className="h-[40px] lg:h-[80px]"
          onChange={(e) => setBuyAmount(e.target.value)}
          placeholder="Enter ETH amount"
          style={{
            width: '85%',
            padding: '8px',
            borderRadius: '4px',
            textAlign: 'center',
            border: '1px solid var(--midBlue)',
            backgroundColor: 'var(--lightBlue)',
          }}
        />
        {buyError && <p style={{ color: 'red' }}>{buyError}</p>}
        <button
          className="h-[10dvh] "
          style={{
            width: '85%',
            padding: '10px',
            backgroundColor: 'green',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            color: 'var(--creamWhite)',
          }}
          onClick={() => handleBuy(buyAmount, 'buy')}
        >
          {`CONFIRM BUY FOR ${estimatedBuy} ${coin.name.toUpperCase()}`}
        </button>
      </Box>
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
