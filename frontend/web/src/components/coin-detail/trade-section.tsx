import React, { useState } from 'react'

import TransactionGraduated from '@/components/trade/transaction-graduated'
import TransactionNonGraduated from '@/components/trade/transaction-nongraduated'
import { Coin } from '@/types/coin'
import { Box, Modal } from '@mui/material'

type TradeSectionProps = {
  coin: Coin
}

export const TradeSection: React.FC<TradeSectionProps> = ({ coin }) => {
  const [modalOpen, setModalOpen] = useState<boolean>(false)
  const [modalMessage, setModalMessage] = useState<string>('')

  return (
    <div className="flex flex-col items-center w-full">
      <Box
        sx={{
          marginBottom: 4,
          width: { xs: '300px', sm: '450px' },
        }}
      >
        <div className="w-full flex flex-col items-center text-center gap-2">
          {/* TODO: remove this */}

          {coin && coin.graduated ? (
            <TransactionGraduated
              coin={coin}
              modalOpen={modalOpen}
              modalMessage={modalMessage}
              setModalOpen={setModalOpen}
            />
          ) : (
            <TransactionNonGraduated
              coin={coin}
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

export default TradeSection
