import { useState } from 'react'
import { useSwipeable } from 'react-swipeable'
import { formatEther } from 'viem'

import { Box, Modal } from '@mui/material'

import { Coin } from '../../types/coin'
import BalanceDisplay from '../trade/balance-section'
import TransactionGraduated from '../trade/transaction-graduated'
import TransactionNonGraduated from '../trade/transaction-nongraduated'

interface TradeSectionProps {
  coin: Coin
  weiIn: bigint | null
  loadingEthIn: boolean
  viewEthIn: () => Promise<void>
  refreshWeiIn: () => Promise<void>
  buyAmount: string
  setBuyAmount: React.Dispatch<React.SetStateAction<string>>
  buyError: string | null
  handleBuy: () => Promise<void>
  modalOpen: boolean
  modalMessage: string
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export default function TradeSection({
  coin,
  weiIn,
  loadingEthIn,
  viewEthIn,
  refreshWeiIn,
  buyAmount,
  setBuyAmount,
  buyError,
  handleBuy,
  modalOpen,
  modalMessage,
  setModalOpen,
}: TradeSectionProps) {
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      if (coin.graduated) {
        // @ts-expect-error this is fine
        setTradeType('sell')
        // @ts-expect-error this is fine
        setSellAmount('')
      }
    },
    onSwipedRight: () => {
      // @ts-expect-error this is fine
      setTradeType('buy')
      setBuyAmount('')
    },
    trackMouse: true,
  })

  return (
    <div {...swipeHandlers} className="flex flex-col items-center w-full">
      <Box
        sx={{
          marginBottom: 4,
          width: { xs: '300px', sm: '450px' },
        }}
      >
        <div className="w-full flex flex-col items-center text-center gap-2">
          {/* Balance Display & Refresh Section */}
          <BalanceDisplay
            coin={coin}
            balance={weiIn ? formatEther(weiIn) : null}
            refreshBalance={refreshWeiIn}
            loading={loadingEthIn}
          />
          {coin && coin.graduated ? (
            <TransactionGraduated
              coin={coin}
              // @ts-expect-error this is fine
              weiIn={weiIn}
              loadingEthIn={loadingEthIn}
              viewEthIn={viewEthIn}
              refreshWeiIn={refreshWeiIn}
              buyAmount={buyAmount}
              setBuyAmount={setBuyAmount}
              buyError={buyError}
              handleBuy={handleBuy}
              modalOpen={modalOpen}
              modalMessage={modalMessage}
              setModalOpen={setModalOpen}
            />
          ) : (
            <TransactionNonGraduated
              coin={coin}
              // @ts-expect-error this is fine
              weiIn={weiIn}
              loadingEthIn={loadingEthIn}
              viewEthIn={viewEthIn}
              refreshWeiIn={refreshWeiIn}
              buyAmount={buyAmount}
              setBuyAmount={setBuyAmount}
              buyError={buyError}
              handleBuy={handleBuy}
              modalOpen={modalOpen}
              modalMessage={modalMessage}
              setModalOpen={setModalOpen}
            />
          )}
        </div>
      </Box>

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
    </div>
  )
}
