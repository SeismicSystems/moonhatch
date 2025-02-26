import React, { useState } from 'react'
import { Box, Button } from '@mui/material'

import type { Coin } from '@/types/coin'
import { ModalBox } from '@/components/trade/modal-box'
import { TradeInnerBox, TradeOuterBox } from '@/components/trade/trade-box'
import { Buy } from '@/components/trade/trade-buy'
import { Sell } from '@/components/trade/trade-sell'

export type TransactionGraduatedProps = {
  coin: Pick<Coin, 'id' | 'graduated' | 'name'>
  buyAmount: string
  setBuyAmount: (value: string) => void
  buyError: string | null
  handleBuy: (amount: string, tradeType: 'buy' | 'sell') => void
  modalOpen: boolean
  modalMessage: string
  setModalOpen: (open: boolean) => void
}

export const TransactionGraduated: React.FC<TransactionGraduatedProps> = (props) => {
  const {
    modalOpen,
    modalMessage,
    setModalOpen,
  } = props
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy')

  // Toggle Button container using sx style
  const toggleContainerSx = {
    display: 'flex',
    width: '100%',
    borderRadius: '9999px',
    overflow: 'hidden',
  }

  // Toggle Button styles using sx with responsive values
  const toggleButtonSx = (
    active: boolean,
    activeBg: string,
    inactiveBg: string
  ) => ({
    flex: 1,
    border: 'none',
    cursor: 'pointer',
    backgroundColor: active ? activeBg : inactiveBg,
    color: active ? 'white' : 'gray',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px',
    fontSize: { xs: '1rem', sm: '1.1rem', md: '1.3rem', lg: '1.5rem' },
    height: { xs: '40px', sm: '50px', md: '60px', lg: '80px' },
  })

  return (
    <TradeOuterBox>
      <TradeInnerBox sx={{ gap: '24px' }}>
        {/* Custom Toggle */}
        <Box sx={toggleContainerSx}>
          <Box
            component="button"
            sx={toggleButtonSx(tradeType === 'buy', 'green', 'var(--midBlue)')}
            onClick={() => setTradeType('buy')}
          >
            <div className="buy-text text-[var(--creamWhite)]">Buy</div>
          </Box>
          <Box
            component="button"
            sx={toggleButtonSx(tradeType === 'sell', 'red', 'var(--midBlue)')}
            onClick={() => setTradeType('sell')}
          >
            <div className="sell-text text-[var(--creamWhite)]">Sell</div>
          </Box>
        </Box>

        {/* Trade Input and Confirm Button */}
        {tradeType === 'buy' ? <Buy {...props} /> : <Sell {...props} />}
      </TradeInnerBox>

      <ModalBox modalOpen={modalOpen} setModalOpen={setModalOpen}>
        <h2 style={{ fontWeight: 'bold' }}>Warning</h2>
        <p>{modalMessage}</p>
        <Button
          sx={{
            fontFamily: 'inherit',
            backgroundColor: 'blue',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '4px',
            mt: 2,
            textTransform: 'none',
            '&:hover': { backgroundColor: 'darkblue' },
          }}
          onClick={() => setModalOpen(false)}
        >
          OK
        </Button>
      </ModalBox>
    </TradeOuterBox>
  )
}

export default TransactionGraduated
