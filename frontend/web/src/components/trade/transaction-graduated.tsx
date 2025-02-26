import { useEffect, useMemo, useState } from 'react'
import { Box, Button, Modal, TextField } from '@mui/material'
import { Coin } from '@/types/coin'

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
      <TextField
        variant="outlined"
        value={buyAmount}
        onChange={(e) => setBuyAmount(e.target.value)}
        placeholder="ENTER ETH AMOUNT"
        fullWidth
        sx={{
          '& .MuiOutlinedInput-input': {
            textAlign: 'center',
            color: 'var(--darkBlue)',

            fontSize: {
              xs: '1rem',
              sm: '1.1rem',
              md: '1.2rem',
              lg: '1.3rem',
            },
          },
          backgroundColor: 'var(--lightBlue)',
          borderRadius: '4px',
          mb: 1,
        }}
      />
      {buyError && <p style={{ color: 'red' }}>{buyError}</p>}
      <Button
        fullWidth
        sx={{
          height: { xs: '60px', sm: '70px', md: '80px', lg: '90px' },
          padding: { xs: '50px', sm: '50px', md: '50px', lg: '50px' },
          backgroundColor: 'green',

          fontFamily: 'inherit',

          color: 'var(--creamWhite)',
          borderRadius: '4px',
          fontSize: {
            xs: '1rem',
            sm: '1.1rem',
            md: '1.2rem',
            lg: '1.3rem',
          },
          textTransform: 'none',
          '&:hover': { backgroundColor: 'darkgreen' },
        }}
        onClick={() => handleBuy(buyAmount, 'buy')}
      >
        {`CONFIRM BUY FOR ${estimatedBuy} ${coin.name.toUpperCase()}`}
      </Button>
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
      <TextField
        variant="outlined"
        value={sellAmount}
        onChange={(e) => setSellAmount(e.target.value)}
        placeholder={`ENTER ${coin.name.toUpperCase()} AMOUNT`}
        fullWidth
        sx={{
          '& .MuiOutlinedInput-input': {
            textAlign: 'center',
            color: 'var(--darkBlue)',
            fontSize: {
              xs: '1rem',
              sm: '1.1rem',
              md: '1.2rem',
              lg: '1.3rem',
            },
          },
          backgroundColor: 'var(--lightBlue)',
          borderRadius: '4px',
          mb: 1,
        }}
      />
      {buyError && <p style={{ color: 'red' }}>{buyError}</p>}
      <Button
        fullWidth
        sx={{
          fontFamily: 'inherit',
          height: { xs: '60px', sm: '70px', md: '80px', lg: '90px' },

          padding: { xs: '8px', sm: '10px', md: '12px', lg: '14px' },
          backgroundColor: 'red',
          color: 'white',
          borderRadius: '4px',
          fontSize: {
            xs: '1rem',
            sm: '1.1rem',
            md: '1.2rem',
            lg: '1.3rem',
          },
          textTransform: 'none',
          '&:hover': { backgroundColor: 'darkred' },
        }}
        onClick={() => handleBuy(sellAmount, 'sell')}
      >
        {`CONFIRM SELL FOR ${estimatedSell} ETH`}
      </Button>
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
    <Box
      sx={{
        width: { xs: '300px', sm: '450px' },
        mx: 'auto',
        p: { xs: 0, sm: 0, md: 3, lg: 1 },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
        }}
      >
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
        </Box>
      </Modal>
    </Box>
  )
}
