import { useMemo } from 'react'

import { ModalBox } from '@/components/trade/modal-box'
import { TradeInnerBox, TradeOuterBox } from '@/components/trade/trade-box'
import { Coin } from '@/types/coin'

import { NonGraduatedAmountInput } from './amount-input'
import { NonGraduatedTradeButton } from './trade-button'

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
    <TradeOuterBox>
      <TradeInnerBox sx={{ height: 'auto', gap: '16px' }}>
        <NonGraduatedAmountInput
          amount={buyAmount}
          setAmount={setBuyAmount}
          placeholder="ENTER ETH AMOUNT"
        />
        {buyError && <p style={{ color: 'red' }}>{buyError}</p>}
        <NonGraduatedTradeButton onClick={() => handleBuy(buyAmount, 'buy')}>
          {`CONFIRM BUY FOR ${estimatedBuy} ${coin.name.toUpperCase()}`}
        </NonGraduatedTradeButton>
      </TradeInnerBox>
      <ModalBox modalOpen={modalOpen} setModalOpen={setModalOpen}>
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
      </ModalBox>
    </TradeOuterBox>
  )
}
