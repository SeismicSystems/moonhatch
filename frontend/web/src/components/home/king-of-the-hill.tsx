import React from 'react'

import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import {
  Avatar,
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
} from '@mui/material'

// Sample data – replace with your dynamic leaderboard data
const sampleKings = [
  {
    rank: 1,
    name: 'PumpCoin',
    score: 12500,
    imageUrl: 'https://via.placeholder.com/50',
  },
  {
    rank: 2,
    name: 'CoinX',
    score: 11000,
    imageUrl: 'https://via.placeholder.com/50',
  },
  {
    rank: 3,
    name: 'CoinY',
    score: 9500,
    imageUrl: 'https://via.placeholder.com/50',
  },
]

const KingOfTheHillSection: React.FC = () => {
  return (
    <Box
      sx={{
        padding: '2rem',
        backgroundColor: 'var(--darkBlue)', // darkBlue
        borderRadius: '12px',
      }}
    >
      <Typography
        variant="h3"
        sx={{
          color: 'var(--creamWhite)', // creamWhite
          mb: 2,
          fontFamily: "'Tomorrow', sans-serif",
        }}
      >
        KING OF THE HILL{' '}
      </Typography>
      <Typography
        variant="subtitle1"
        sx={{
          color: 'var(--lightBlue)', // lightBlue
          mb: 3,
          fontFamily: "'Tomorrow', sans-serif",
        }}
      >
        TOP COINS CLOSEST TO GRADUATION{' '}
      </Typography>
      <List>
        {sampleKings.map((coin, index) => (
          <ListItem
            key={coin.rank}
            sx={{
              mb: 1,
              backgroundColor: index === 0 ? 'var(--midBlue)' : 'transparent', // Highlight top coin
              borderRadius: '8px',
              padding: '0.5rem',
            }}
          >
            <ListItemAvatar>
              <Avatar
                src={coin.imageUrl}
                alt={coin.name}
                sx={{ width: 48, height: 48 }}
              />
            </ListItemAvatar>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography
                    variant="h6"
                    sx={{
                      color: 'var(--creamWhite)',
                      fontFamily: "'Tomorrow', sans-serif",
                    }}
                  >
                    {coin.name}
                  </Typography>
                  {index === 0 && (
                    <EmojiEventsIcon sx={{ color: '#f6e05e', ml: 1 }} />
                  )}
                </Box>
              }
              secondary={
                <Typography
                  variant="body2"
                  sx={{
                    color: 'var(--lightBlue)',
                    fontFamily: "'Tomorrow', sans-serif",
                  }}
                >
                  Score: {coin.score}
                </Typography>
              }
            />
          </ListItem>
        ))}
      </List>
    </Box>
  )
}

export default KingOfTheHillSection
