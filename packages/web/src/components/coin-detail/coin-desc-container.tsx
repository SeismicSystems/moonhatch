import React from 'react'

import { Coin } from '@/types/coin'
import { Box } from '@mui/material'

const CoinDescriptionContainer: React.FC<{ coin: Coin }> = ({ coin }) => {
  return (
    <>
      {' '}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          color: 'var(--lightBlue)',
          fontSize: '0.75rem',
          '& .coin-desc': {
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            marginBottom: 2,
            fontSize: { xs: '1rem', sm: '1rem', md: '1.2rem', lg: '1.4rem' },
          },
        }}
      >
        <div className="coin-desc mt-2 flex flex-col items-center justify-center">
          <div className="flex text-xs xl:text-lg text-orange-300">
            DESCRIPTION:{' '}
          </div>
          <div className="lg:text-lg overflow-hidden text-ellipsis">
            "{coin.description || 'creator did not provide description'}"
          </div>
        </div>
      </Box>
    </>
  )
}

export default CoinDescriptionContainer
