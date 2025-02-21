import React from 'react'

import { Box, Typography, useMediaQuery } from '@mui/material'

export interface CoinData {
  rank: number
  name: string
  symbol: string
  score: number
  imageUrl: string
  ticker?: string
}

interface KOTHBoxProps {
  coin: CoinData
  variant?: 'desktop' | 'mobile'
}

const KOTHBox: React.FC<KOTHBoxProps> = ({ coin, variant = 'desktop' }) => {
  console.log(coin)
  const isDesktop = useMediaQuery('(min-width: 880px)')
  const FALLBACK_COIN_IMAGE_URL =
    'https://seismic-public-assets.s3.us-east-1.amazonaws.com/seismic-logo-light.png'

  if (variant === 'mobile') {
    return (
      <Box
        sx={{
          display: 'flex',

          alignItems: 'center',
          height: coin.rank === 1 ? '100px' : '50px',
          width: coin.rank === 1 ? '100px' : '50px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          backgroundColor: 'var(--midBlue)',
          borderRadius: '8px',
          p: 1,
          mb: 2,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: isDesktop ? 'row' : 'column',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            alignItems: 'flex-start',
            width: '100%',
          }}
        >
          <Typography
            variant="h6"
            sx={{
              width: '100%',

              color: 'var(--creamWhite)',
              fontFamily: "'Tomorrow', sans-serif",
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
            }}
          >
            {coin.name}
          </Typography>
          {coin.symbol && (
            <Typography
              variant="body2"
              sx={{
                color: 'var(--lightBlue)',
                fontFamily: "'Tomorrow', sans-serif",
                overflow: 'hidden',
                textAlign: 'center',
                textOverflow: 'ellipsis',
              }}
            >
              {coin.symbol.toUpperCase()}
            </Typography>
          )}
        </Box>
      </Box>
    )
  } else {
    const isChampion = coin.rank === 1
    const boxSize = isChampion ? 100 : 50

    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: isDesktop ? 'column' : 'row',
          alignItems: 'center',
          justifyContent: 'start',
          textAlign: 'left',
          marginLeft: 0,
          mb: isChampion ? 0 : 0,
        }}
      >
        <Box
          sx={{
            backgroundColor: 'var(--midBlue)',
            borderRadius: '8px',
            height: isDesktop ? (coin.rank === 1 ? '150px' : '120px') : boxSize,
            width: isDesktop ? (coin.rank === 1 ? '150px' : '120px') : boxSize,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',

            textAlign: 'left',
            overflow: 'hidden',
            marginRight: isDesktop ? 0 : 2,
            textOverflow: 'ellipsis',
          }}
        >
          <img
            src={coin.imageUrl || FALLBACK_COIN_IMAGE_URL}
            alt={coin.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
            onError={(e) => {
              ;(e.target as HTMLImageElement).src = FALLBACK_COIN_IMAGE_URL
            }}
          />
        </Box>
        <div className="flex flex-col lg:justify-center  justify-around lg:items-center mb-4">
          <Typography
            variant="h6"
            sx={{
              color: 'var(--creamWhite)',
              fontFamily: "'Tomorrow', sans-serif",
              textAlign: isDesktop ? 'center' : 'left',
              width: isDesktop ? '100px' : '200px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              mt:
                coin.rank === 1
                  ? isDesktop
                    ? '.5rem'
                    : '1rem'
                  : isDesktop
                    ? '1rem'
                    : '.75rem',

              mb: coin.rank === 1 ? '-1rem' : '-.25rem',
              fontSize:
                coin.rank === 1
                  ? isDesktop
                    ? '1.5rem'
                    : '2.25rem'
                  : isDesktop
                    ? '1rem'
                    : '.75rem',
            }}
          >
            {coin.name.toUpperCase()}
          </Typography>
          <div className="spacer-div lg:mt-2"> </div>
          <Typography
            variant="body2"
            sx={{
              color: 'var(--lightBlue)',
              width: '100px',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textAlign: isDesktop ? 'center' : 'left',

              textOverflow: 'ellipsis',
              fontFamily: "'Tomorrow', sans-serif",
              fontSize: coin.rank === 1 ? '1rem' : '.75rem',
            }}
          >
            $: {coin.symbol.toUpperCase()}
          </Typography>
        </div>
      </Box>
    )
  }
}

export default KOTHBox
