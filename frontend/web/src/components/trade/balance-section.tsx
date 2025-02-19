import React, { useState } from 'react'

import CachedIcon from '@mui/icons-material/Cached'
import { Box, CircularProgress, IconButton } from '@mui/material'

interface BalanceDisplayProps {
  coin: Coin
  balance: string | null
  refreshBalance: () => void
  loading: boolean
}

const BalanceDisplay: React.FC<BalanceDisplayProps> = ({
  coin,
  balance,
  refreshBalance,
  loading,
}) => {
  const [revealed, setRevealed] = useState(false)

  const handleReveal = () => {
    setRevealed(true)
  }

  return (
    <Box
      sx={{
        marginBottom: 4,
        width: { xs: '300px', sm: '450px' },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
      }}
    >
      {/* Header */}
      <div style={{ fontSize: '1.25rem', color: 'var(--creamWhite)' }}>
        BALANCE
      </div>

      <Box
        sx={{
          width: '85%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <IconButton
          sx={{
            backgroundColor: 'var(--midBlue)',
            color: 'var(--creamWhite)',
            transition: 'transform 0.5s',
            '&:active': {
              backgroundColor: 'var(--darkBlue)',
              transform: 'rotate(360deg) scale(1.2)',
            },
            '&:hover': { backgroundColor: 'var(--midBlue)' },
          }}
          onClick={refreshBalance}
        >
          <CachedIcon />
        </IconButton>

        <Box
          onClick={handleReveal}
          sx={{
            flexGrow: 1,
            marginLeft: 2,
            height: '50px',
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: revealed
              ? 'var(--lightBlue)'
              : 'rgba(255, 255, 255, 0.2)',
            backdropFilter: revealed ? 'none' : 'blur(10px)',
            cursor: 'pointer',
            border: '1px solid rgba(255,255,255,0.3)',
            transition: 'background 0.3s, backdrop-filter 0.3s',
          }}
        >
          {loading ? (
            <CircularProgress size={24} sx={{ color: 'var(--darkBlue)' }} />
          ) : revealed ? (
            <span style={{ color: 'var(--green)', fontWeight: 'bold' }}>
              {balance
                ? `${balance} ${coin.name.toUpperCase()}`
                : 'No balance available'}
            </span>
          ) : (
            <span style={{ color: '#ccc' }}>CLICK TO SEE BALANCE</span>
          )}
        </Box>
      </Box>
    </Box>
  )
}

export default BalanceDisplay
