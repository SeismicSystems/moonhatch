import React, { useEffect, useMemo, useState } from 'react'

import { GraduatedAmountInput } from '@/components/trade/amount-input'
import { GraduatedTradeButton } from '@/components/trade/trade-button'
import { TransactionGraduatedProps } from '@/components/trade/transaction-graduated'

export const Sell: React.FC<TransactionGraduatedProps> = ({
  coin,
  buyError,
  handleBuy,
}) => {
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
