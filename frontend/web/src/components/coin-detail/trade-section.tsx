import React from 'react'

import TransactionGraduated from '@/components/trade/transaction-graduated'
import TransactionNonGraduated from '@/components/trade/transaction-nongraduated'
import { Coin } from '@/types/coin'
import { Box } from '@mui/material'

type TradeSectionProps = {
  coin: Coin
}

export const TradeSection: React.FC<TradeSectionProps> = ({ coin }) => {
  return (
    <div className="flex flex-col items-center w-full">
      <Box
        sx={{
          marginBottom: 4,
          width: { xs: '300px', sm: '450px' },
        }}
      >
        <div className="w-full flex flex-col items-center text-center gap-2">
          {coin.graduated ? (
            <TransactionGraduated coin={coin} />
          ) : (
            <TransactionNonGraduated coin={coin} />
          )}
        </div>
      </Box>
    </div>
  )
}

export default TradeSection
