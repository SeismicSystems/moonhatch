import React, { useMemo } from 'react'

import { GraduatedAmountInput } from '@/components/trade/amount-input'
import { GraduatedTradeButton } from '@/components/trade/trade-button'
import { TransactionGraduatedProps } from '@/components/trade/transaction-graduated'

export const Buy: React.FC<TransactionGraduatedProps> = ({
  coin,
  buyAmount,
  setBuyAmount,
  buyError,
  handleBuy,
}) => {
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
        placeholder="SET ETH AMOUNT"
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
