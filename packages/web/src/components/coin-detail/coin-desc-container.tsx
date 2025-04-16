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
          color: 'var(--creamWhite)',
          bgcolor: 'var(--midBlue)',
          fontSize: '0.75rem',
          marginBottom: 2,
          marginTop: 2,
          borderRadius: '2rem',
          p: 2,
          '& .coin-desc': {
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            marginBottom: 2,
            fontSize: { xs: '1rem', sm: '1rem', md: '1.2rem', lg: '1.4rem' },
          },
        }}
      >
        <Box
          className="coin-desc"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            mt: 2,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              fontSize: { xs: '0.75rem', xl: '1.125rem' },
              color: 'orange',
            }}
          >
            DESCRIPTION:{' '}
          </Box>
          <Box
            sx={{
              fontSize: { xs: 'inherit', lg: '1.125rem' },
              overflowY: 'auto',
              height: 'auto',
              textOverflow: 'ellipsis',
            }}
          >
            "{coin.description || 'creator did not provide description'}"
          </Box>
        </Box>
      </Box>
    </>
  )
}

export default CoinDescriptionContainer
