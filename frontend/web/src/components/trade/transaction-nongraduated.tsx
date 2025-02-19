import { useMemo } from 'react'
import { formatEther } from 'viem'

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
  // Dummy conversion rate: 1 ETH = 1000 Coin X
  const conversionRate = 1000

  // Estimated value for BUY: multiply ETH by conversionRate
  const estimatedBuy = useMemo(() => {
    const inputValue = parseFloat(buyAmount)
    return isNaN(inputValue) || inputValue <= 0
      ? 0
      : inputValue * conversionRate
  }, [buyAmount, conversionRate])

  return (
    <Box sx={{ width: { xs: '300px', sm: '450px' }, mx: 'auto', p: 4 }}>
      <div className="flex flex-col items-center text-center gap-2">
        {/* Always-visible Buy Input */}
        <input
          type="text"
          value={buyAmount}
          onChange={(e) => setBuyAmount(e.target.value)}
          placeholder="Enter ETH amount"
          className="w-full p-2 bg-[var(--lightBlue)] text-center rounded mb-2 text-[var(--midBlue)]"
        />
        <div className="text-[var(--creamWhite)]">
          You will receive: {estimatedBuy} Coin X
        </div>
        {buyError && <p className="text-red-500 text-sm">{buyError}</p>}
        <button
          className="w-full px-4 py-2 rounded bg-green-500 text-white"
          onClick={() => handleBuy(buyAmount, 'buy')}
        >
          {`CONFIRM BUY FOR ${estimatedBuy} ${coin.name}`}
        </button>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Box className="p-4 bg-white border rounded shadow-lg text-center">
          <h2 className="text-lg font-bold">Warning</h2>
          <p>{modalMessage}</p>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
            onClick={() => setModalOpen(false)}
          >
            OK
          </button>
        </Box>
      </Modal>
    </Box>
  )
}
