import React from 'react'

import { Box, Typography, useMediaQuery, useTheme } from '@mui/material'

import KOTHBox, { CoinData } from './koth-box'

// Sample data – replace with your dynamic leaderboard data
const sampleKings: CoinData[] = [
  {
    rank: 1,
    name: 'PumpCoin',
    score: 12500,
    imageUrl: 'https://via.placeholder.com/100',
  },
  {
    rank: 2,
    name: 'CoinX',
    score: 11000,
    imageUrl: 'https://via.placeholder.com/100',
  },
  {
    rank: 3,
    name: 'CoinY',
    score: 9500,
    imageUrl: 'https://via.placeholder.com/100',
  },
]

const KingOfTheHillSection: React.FC = () => {
  const theme = useTheme()
  const isDesktop = useMediaQuery('(min-width: 780px)')

  // For the podium layout, we want the order: Rank 2, Rank 1, Rank 3.
  const podiumOrder = [
    sampleKings.find((c) => c.rank === 2)!,
    sampleKings.find((c) => c.rank === 1)!,
    sampleKings.find((c) => c.rank === 3)!,
  ]

  if (isDesktop) {
    return (
      <Box
        sx={{
          padding: '2rem',
          backgroundColor: 'var(--darkBlue)',
          borderRadius: '12px',
          margin: '2rem 0',
          textAlign: 'center',
          width: { md: '60%', lg: '60%' },
          height: '300px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <Typography
          variant="h3"
          sx={{
            color: 'var(--creamWhite)',
            fontSize: { xs: '1.5rem', sm: '2rem', md: '2rem' },
            mt: 2,
            mb: 2,
            fontFamily: "'Tomorrow', sans-serif",
          }}
        >
          KING OF THE HILL
        </Typography>

        <Box
          sx={{
            gap: 2,
            width: '100%',
            display: 'flex',
            flexDirection: isDesktop ? 'row' : 'column',
            justifyContent: isDesktop ? 'center' : 'start',
            alignItems: 'center',
          }}
        >
          {podiumOrder.map((coin) => (
            <KOTHBox key={coin.rank} coin={coin} />
          ))}
        </Box>
      </Box>
    )
  } else {
    // MOBILE CONTAINER
    return (
      <Box
        sx={{
          padding: '1rem',
          backgroundColor: 'var(--darkBlue)',
          borderRadius: '12px',
          width: { xs: '100%', sm: '60%', md: '100%', lg: '100%' },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          margin: '2rem 0',
        }}
      >
        <Typography
          variant="h3"
          sx={{
            color: 'var(--creamWhite)',
            mb: 2,
            fontFamily: "'Tomorrow', sans-serif",
          }}
        >
          KINGS OF THE CURVE
        </Typography>

        {sampleKings.map((coin) => (
          <Box
            key={coin.rank}
            sx={{
              mb: 1,
              backgroundColor:
                coin.rank === 1 ? 'var(--midBlue)' : 'var(--midBlue)',
              height: coin.rank === 1 ? '100px' : '50px',
              width: coin.rank === 1 ? '100%' : '75%',

              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'start',

              paddingLeft: '10p',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <KOTHBox coin={coin} />
          </Box>
        ))}
      </Box>
    )
  }
}

export default KingOfTheHillSection
