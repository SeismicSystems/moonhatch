import React from 'react'

import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import { Avatar, Box, Typography, useMediaQuery, useTheme } from '@mui/material'

// Sample data – replace with your dynamic leaderboard data
const sampleKings = [
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
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'))

  if (isDesktop) {
    // Desktop: Olympic podium layout
    return (
      <Box
        sx={{
          padding: '2rem',
          backgroundColor: 'var(--darkBlue)',
          borderRadius: '12px',
          margin: '2rem 0',
          textAlign: 'center',
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
          KING OF THE HILL
        </Typography>
        <Typography
          variant="subtitle1"
          sx={{
            color: 'var(--lightBlue)',
            mb: 3,
            fontFamily: "'Tomorrow', sans-serif",
          }}
        >
          TOP COINS CLOSEST TO GRADUATION
        </Typography>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-end',
            gap: 2,
            position: 'relative',
          }}
        >
          {/* Rank 2 */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Box
              sx={{
                backgroundColor: 'var(--midBlue)',
                borderRadius: '8px',
                p: 1,
                height: '120px',
                width: '120px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Avatar
                src={sampleKings[1].imageUrl}
                alt={sampleKings[1].name}
                sx={{ width: 80, height: 80 }}
              />
            </Box>
            <Typography
              variant="h6"
              sx={{
                color: 'var(--creamWhite)',
                fontFamily: "'Tomorrow', sans-serif",
                mt: 1,
              }}
            >
              {sampleKings[1].name}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'var(--lightBlue)',
                fontFamily: "'Tomorrow', sans-serif",
              }}
            >
              Score: {sampleKings[1].score}
            </Typography>
          </Box>
          {/* Rank 1 */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mb: 2,
            }}
          >
            <Box
              sx={{
                backgroundColor: 'var(--midBlue)',
                borderRadius: '8px',
                p: 1.5,
                height: '150px',
                width: '150px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}
            >
              <Avatar
                src={sampleKings[0].imageUrl}
                alt={sampleKings[0].name}
                sx={{ width: 100, height: 100 }}
              />
              <EmojiEventsIcon
                sx={{
                  position: 'absolute',
                  top: -10,
                  right: -10,
                  color: '#f6e05e',
                }}
              />
            </Box>
            <Typography
              variant="h6"
              sx={{
                color: 'var(--creamWhite)',
                fontFamily: "'Tomorrow', sans-serif",
                mt: 1,
              }}
            >
              {sampleKings[0].name}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'var(--lightBlue)',
                fontFamily: "'Tomorrow', sans-serif",
              }}
            >
              Score: {sampleKings[0].score}
            </Typography>
          </Box>
          {/* Rank 3 */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Box
              sx={{
                backgroundColor: 'var(--midBlue)',
                borderRadius: '8px',
                p: 1,
                height: '120px',
                width: '120px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Avatar
                src={sampleKings[2].imageUrl}
                alt={sampleKings[2].name}
                sx={{ width: 80, height: 80 }}
              />
            </Box>
            <Typography
              variant="h6"
              sx={{
                color: 'var(--creamWhite)',
                fontFamily: "'Tomorrow', sans-serif",
                mt: 1,
              }}
            >
              {sampleKings[2].name}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'var(--lightBlue)',
                fontFamily: "'Tomorrow', sans-serif",
              }}
            >
              Score: {sampleKings[2].score}
            </Typography>
          </Box>
        </Box>
      </Box>
    )
  } else {
    // Mobile: simple vertical list layout
    return (
      <Box
        sx={{
          padding: '2rem',
          backgroundColor: 'var(--darkBlue)',
          borderRadius: '12px',
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
          KING OF THE HILL
        </Typography>
        <Typography
          variant="subtitle1"
          sx={{
            color: 'var(--lightBlue)',
            mb: 3,
            fontFamily: "'Tomorrow', sans-serif",
          }}
        >
          TOP COINS CLOSEST TO GRADUATION
        </Typography>
        {sampleKings.map((coin) => (
          <Box
            key={coin.rank}
            sx={{
              mb: 1,
              backgroundColor:
                coin.rank === 1 ? 'var(--midBlue)' : 'transparent',
              borderRadius: '8px',
              p: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Avatar
              src={coin.imageUrl}
              alt={coin.name}
              sx={{ width: 48, height: 48 }}
            />
            <Box>
              <Typography
                variant="h6"
                sx={{
                  color: 'var(--creamWhite)',
                  fontFamily: "'Tomorrow', sans-serif",
                }}
              >
                {coin.name}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: 'var(--lightBlue)',
                  fontFamily: "'Tomorrow', sans-serif",
                }}
              >
                Score: {coin.score}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    )
  }
}

export default KingOfTheHillSection
