import React, { useEffect, useState } from 'react'
import { formatEther } from 'viem'

import { useAppState } from '@/hooks/useAppState'
import { usePumpClient } from '@/hooks/usePumpClient'
import { Coin } from '@/types/coin'
import CachedIcon from '@mui/icons-material/Cached'
import { Box, CircularProgress, IconButton, Typography } from '@mui/material'

type WeiInProps = { coin: Coin }

export const WeiIn: React.FC<WeiInProps> = ({ coin }) => {
  const { loadWeiIn, saveWeiIn } = useAppState()
  const { getWeiIn } = usePumpClient()
  const [revealed, setRevealed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [weiIn, setWeiIn] = useState<bigint | null>(null)

  useEffect(() => {
    setWeiIn(loadWeiIn(coin.id))
  }, [coin.id, loadWeiIn])

  const refreshBalance = (): Promise<void> => {
    if (loading) {
      return Promise.resolve()
    }
    setLoading(true)
    return getWeiIn(BigInt(coin.id))
      .then((wei) => {
        setWeiIn(wei)
        saveWeiIn(coin.id, wei)
      })
      .then(() => {
        setRevealed(true)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  const onClickReveal = () => {
    if (revealed) {
      setRevealed(false)
      return
    }

    if (weiIn === null) {
      refreshBalance()
        .then(() => {
          setRevealed(true)
        })
        .catch(() => {
          setRevealed(false)
        })
      return
    }

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
          onClick={onClickReveal}
          sx={{
            flexGrow: 1,
            marginLeft: 2,
            height: '4rem',
            p: 2,
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
              {weiIn !== null
                ? `${formatEther(weiIn)} ETH spent`
                : 'Sign message to reveal'}
            </Typography>
          ) : (
            <span style={{ color: '#ccc' }}>SEE HOW MUCH YOU'VE BOUGHT</span>
          )}
        </Box>
      </Box>
    </Box>
  )
}

export default WeiIn
