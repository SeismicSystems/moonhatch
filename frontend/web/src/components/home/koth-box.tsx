import React from 'react'

import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import { Avatar, Box, Typography } from '@mui/material'

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
  if (variant === 'mobile') {
    // Mobile layout: a horizontal card spanning 100% width.
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
          width: '100%',
          mb: 2,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
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
    // Desktop layout: Olympic podium style.
    const isChampion = coin.rank === 1
    const boxSize = isChampion ? 100 : 100
    const avatarSize = isChampion ? 50 : 50
    const padding = isChampion ? 1.5 : 1

    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
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
            height: boxSize,
            width: boxSize,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            height: coin.rank === 1 ? '100px' : '50px',
            width: coin.rank === 1 ? '100px' : '50px',
            textAlign: 'left',
            overflow: 'hidden',
            border: '2px solid white',
            marginRight: 2,
          }}
        >
          <img
            src={coin.imageUrl}
            alt={coin.name}
            style={{ width: avatarSize, height: avatarSize }}
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
        <div className="flex flex-col justify-around mb-4">
          <Typography
            variant="h6"
            sx={{
              color: 'var(--creamWhite)',
              fontFamily: "'Tomorrow', sans-serif",
              textAlign: 'left',
              mt: coin.rank === 1 ? '.5rem' : '.75rem',
              mb: coin.rank === 1 ? '-1rem' : '-.25rem',
              fontSize: coin.rank === 1 ? '2.25rem' : '.75rem',
            }}
          >
            {coin.name.toUpperCase()}
          </Typography>
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
