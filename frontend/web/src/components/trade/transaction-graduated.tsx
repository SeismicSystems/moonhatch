import React, { useState } from 'react'
import { useSwipeable } from 'react-swipeable'

import { ModalBox } from '@/components/trade/modal-box'
import { TradeInnerBox, TradeOuterBox } from '@/components/trade/trade-box'
import { Buy } from '@/components/trade/trade-buy'
import { Sell } from '@/components/trade/trade-sell'
import type { Coin } from '@/types/coin'
import { Side } from '@/types/trade'
import { Box, Button, SxProps } from '@mui/material'

export type TransactionGraduatedProps = {
  coin: Coin
  modalOpen: boolean
  modalMessage: string
  setModalOpen: (open: boolean) => void
}

const toggleContainerSx: SxProps = {
  display: 'flex',
  width: '100%',
  borderRadius: '9999px',
  overflow: 'hidden',
}

const toggleButtonSx = ({
  activeSide,
  buttonSide,
}: {
  activeSide: Side
  buttonSide: Side
}): SxProps => {
  const active = activeSide === buttonSide
  const activeBg = buttonSide === Side.BUY ? 'green' : 'red'
  return {
    flex: 1,
    border: 'none',
    cursor: 'pointer',
    backgroundColor: active ? activeBg : 'var(--midBlue)',
    color: active ? 'white' : 'gray',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px',
    fontSize: { xs: '1rem', sm: '1.1rem', md: '1.3rem', lg: '1.5rem' },
    height: { xs: '40px', sm: '50px', md: '60px', lg: '80px' },
  }
}

const buyToggleButtonSx = (activeSide: Side) =>
  toggleButtonSx({ activeSide, buttonSide: Side.BUY })
const sellToggleButtonSx = (activeSide: Side) =>
  toggleButtonSx({ activeSide, buttonSide: Side.SELL })

export const TransactionGraduated: React.FC<TransactionGraduatedProps> = (
  props
) => {
  const { modalOpen, modalMessage, setModalOpen } = props
  const [side, setSide] = useState<Side>(Side.BUY)

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      setSide(Side.SELL)
    },
    onSwipedRight: () => {
      setSide(Side.BUY)
    },
    trackMouse: true,
  })

  return (
    <div {...swipeHandlers}>
      <TradeOuterBox>
        <TradeInnerBox sx={{ gap: '24px' }}>
          {/* Custom Toggle */}
          <Box sx={toggleContainerSx}>
            <Box
              component="button"
              sx={buyToggleButtonSx(side)}
              onClick={() => setSide(Side.BUY)}
            >
              <div className="buy-text text-[var(--creamWhite)]">Buy</div>
            </Box>
            <Box
              component="button"
              sx={sellToggleButtonSx(side)}
              onClick={() => setSide(Side.SELL)}
            >
              <div className="sell-text text-[var(--creamWhite)]">Sell</div>
            </Box>
          </Box>

          {/* Trade Input and Confirm Button */}
          {side === Side.BUY ? <Buy {...props} /> : <Sell {...props} />}
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
    </div>
  )
}

export default TransactionGraduated
