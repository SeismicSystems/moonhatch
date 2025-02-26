import { useMemo } from 'react'

import { TradeInnerBox, TradeOuterBox } from '@/components/trade/trade-box'
import { Coin } from '@/types/coin'

import { NonGraduatedAmountInput } from './amount-input'
import { NonGraduatedTradeButton } from './trade-button'

interface TransactionNonGraduatedProps {
  coin: Pick<Coin, 'id' | 'name'>
  buyAmount: string
  setBuyAmount: (value: string) => void
  handleBuy: (amount: string, tradeType: 'buy') => void
}

export default function TransactionNonGraduated({
  coin,
  buyAmount,
  setBuyAmount,
  handleBuy,
}: TransactionNonGraduatedProps) {
  const conversionRate = 1000

  const estimatedBuy = useMemo(() => {
    const inputValue = parseFloat(buyAmount)
    return isNaN(inputValue) || inputValue <= 0
      ? 0
      : inputValue * conversionRate
  }, [buyAmount, conversionRate])

  return (
    <TradeOuterBox>
      <TradeInnerBox sx={{ height: 'auto', gap: '16px' }}>
        <NonGraduatedAmountInput
          amount={buyAmount}
          setAmount={setBuyAmount}
          placeholder="ENTER ETH AMOUNT"
        />

        <NonGraduatedTradeButton onClick={() => handleBuy(buyAmount, 'buy')}>
          {`CONFIRM BUY FOR ${estimatedBuy} ${coin.name.toUpperCase()}`}
        </NonGraduatedTradeButton>
      </TradeInnerBox>
    </TradeOuterBox>
  )
}
