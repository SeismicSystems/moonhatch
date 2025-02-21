import React from 'react'

import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import { Avatar, Box, Typography, useMediaQuery } from '@mui/material'

export interface CoinData {
  rank: number
  name: string
  score: number
  imageUrl: string
  ticker?: string
}

interface KOTHBoxProps {
  coin: CoinData
  variant?: 'desktop' | 'mobile'
}

const KOTHBox: React.FC<KOTHBoxProps> = ({ coin, variant = 'desktop' }) => {
  const isDesktop = useMediaQuery('(min-width: 880px)')

  if (variant === 'mobile') {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          height: coin.rank === 1 ? '100px' : '50px',
          width: coin.rank === 1 ? '100px' : '50px',

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

            alignItems: 'flex-start',
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: 'var(--creamWhite)',
              fontFamily: "'Tomorrow', sans-serif",
            }}
          >
            {coin.name}
          </Typography>
          {coin.ticker && (
            <Typography
              variant="body2"
              sx={{
                color: 'var(--lightBlue)',
                fontFamily: "'Tomorrow', sans-serif",
              }}
            >
              {coin.ticker.toUpperCase()}
            </Typography>
          )}
        </Box>
      </Box>
    )
  } else {
    const isChampion = coin.rank === 1
    const boxSize = isChampion ? 100 : 50
    const avatarSize = isChampion ? 50 : 50
    const padding = isChampion ? 1.5 : 1

    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: isDesktop ? 'column' : 'row',
          alignItems: 'center',
          justifyContent: 'start',
          textAlign: 'left',
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
            // border: '2px solid white',
            marginRight: isDesktop ? 0 : 2,
          }}
        >
          <img
            src={coin.imageUrl}
            alt={coin.name}
            style={{
              width: isDesktop ? '80px' : avatarSize,
              height: avatarSize,
            }}
          />
          {isChampion && (
            <EmojiEventsIcon
              sx={{
                position: 'absolute',
                top: -10,
                right: -10,
                color: '#f6e05e',
              }}
            />
          )}
        </Box>
        <div className="flex flex-col lg:justify-center  justify-around lg:items-center mb-4">
          <Typography
            variant="h6"
            sx={{
              color: 'var(--creamWhite)',
              fontFamily: "'Tomorrow', sans-serif",
              textAlign: isDesktop ? 'center' : 'left',
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
              fontFamily: "'Tomorrow', sans-serif",
              fontSize: coin.rank === 1 ? '1.25rem' : '.75rem',
            }}
          >
            {/* replace with ticker  */}
            $: {coin.score}
          </Typography>
        </div>
      </Box>
    )
  }
}

export default KOTHBox
