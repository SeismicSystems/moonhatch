import { useEffect, useMemo, useState } from 'react'
import { Box, Button } from '@mui/material'

import type { Coin } from '@/types/coin'
import { ModalBox } from '@/components/trade/modal-box'
import { TradeInnerBox, TradeOuterBox } from '@/components/trade/trade-box'
import { GraduatedAmountInput } from '@/components/trade/amount-input'
import { GraduatedTradeButton } from '@/components/trade/trade-button'

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

const Buy: React.FC<TransactionGraduatedProps> = ({ coin, buyAmount, setBuyAmount, buyError, handleBuy }) => {

  // Dummy conversion rate: 1 ETH = 1000 Coin X
  const conversionRate = 1000

  const estimatedBuy = useMemo(() => {
    const inputValue = parseFloat(buyAmount)
    return isNaN(inputValue) || inputValue <= 0
      ? 0
      : inputValue * conversionRate
  }, [buyAmount, conversionRate])


  return (
    <>
      <GraduatedAmountInput
        amount={buyAmount}
        setAmount={setBuyAmount}
        placeholder='SET ETH AMOUNT'
      />
      {buyError && <p style={{ color: 'red' }}>{buyError}</p>}
      <GraduatedTradeButton
        onClick={() => handleBuy(buyAmount, 'buy')}
        sx={{
          padding: { xs: '50px', sm: '50px', md: '50px', lg: '50px' },
          color: 'var(--creamWhite)',
          backgroundColor: 'green',
          '&:hover': { backgroundColor: 'darkgreen' },
        }}
      >
        {`CONFIRM BUY FOR ${estimatedBuy} ${coin.name.toUpperCase()}`}
      </GraduatedTradeButton>
    </>
  )
}


const Sell: React.FC<TransactionGraduatedProps> = ({ coin, buyError, handleBuy }) => {
  const [sellAmount, setSellAmount] = useState('')

  // Dummy conversion rate: 1 ETH = 1000 Coin X
  const conversionRate = 1000

  const estimatedSell = useMemo(() => {
    const inputValue = parseFloat(sellAmount)
    return isNaN(inputValue) || inputValue <= 0
      ? 0
      : inputValue / conversionRate
  }, [sellAmount, conversionRate])


  useEffect(() => {
    setSellAmount('')
  }, [])

  return (
    <>
      <GraduatedAmountInput
        amount={sellAmount}
        setAmount={setSellAmount}
        placeholder={`ENTER ${coin.name.toUpperCase()} AMOUNT`}
      />
      {buyError && <p style={{ color: 'red' }}>{buyError}</p>}
      <GraduatedTradeButton
        onClick={() => handleBuy(sellAmount, 'sell')}
        sx={{
          padding: { xs: '8px', sm: '10px', md: '12px', lg: '14px' },
          color: 'white',
          backgroundColor: 'red',
          '&:hover': { backgroundColor: 'darkred' },
        }}
      >
        {`CONFIRM SELL FOR ${estimatedSell} ETH`}
      </GraduatedTradeButton>
    </>
  )
}

export default function TransactionGraduated(props: TransactionGraduatedProps) {
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
