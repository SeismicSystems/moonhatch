import React, { useEffect, useState } from 'react'

import CachedIcon from '@mui/icons-material/Cached'
import { Box, CircularProgress, IconButton, Typography } from '@mui/material'
import { Coin } from '@/types/coin'
import { usePumpClient } from '@/hooks/usePumpClient'

type WeiInProps = { coin: Coin }

export const WeiIn: React.FC<WeiInProps> = ({ coin }) => {
  const [revealed, setRevealed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [weiIn, setWeiIn] = useState<bigint | null>(null)

  useEffect(() => {
    const cachedWei = localStorage.getItem(`weiIn_coin_${coin.id}`)
    if (cachedWei) setWeiIn(BigInt(cachedWei))
  }, [coin.id])

  const { getWeiIn } = usePumpClient()

  const refreshBalance = async () => {
    if (loading) {
      return
    }
    getWeiIn(coin.id)
      .then((wei) => { setWeiIn(wei) })
      .finally(() => { setLoading(false) })
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
      <Typography
        sx={{
          fontSize: { xs: '1rem', sm: '1.5rem', md: '1.2rem', lg: '1.5rem' },
          color: 'var(--creamWhite)',
        }}
      >
        {coin.graduated ? 'BALANCE' : 'ETH INVESTED'}
      </Typography>

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
          onClick={() => setRevealed(!revealed)}
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
            <Typography
              sx={{
                color: 'var(--green)',
                fontWeight: 'bold',
                fontSize: {
                  xs: '.8rem',
                  sm: '.8rem',
                  md: '1rem',
                  lg: '1.2rem',
                },
              }}
            >
              {weiIn
                ? `${weiIn} ${coin.name.toUpperCase()}`
                : 'NO BALANCE AVAILABLE'}
            </Typography>
          ) : (
            <span style={{ color: '#ccc' }}>CLICK TO SEE BALANCE</span>
          )}
        </Box>
      </Box>
    </Box>
  )
}

export default WeiIn
