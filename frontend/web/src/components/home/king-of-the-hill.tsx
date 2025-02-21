import React from 'react'

import { useAppSelector } from '@/store/hooks'
import { Box, Typography, useMediaQuery, useTheme } from '@mui/material'

import KOTHBox, { CoinData } from './koth-box'

interface KingOfTheHillSectionProps {
  coins: Coin[]
}

export default function KingOfTheHillSection({
  coins,
}: KingOfTheHillSectionProps) {
  const isDesktop = useMediaQuery('(min-width: 780px)')
  // Assume coins is an array of coins that include a 'weiIn' property (a BigInt)
  const sortedCoins = [...coins].sort((a, b) => {
    const weiA = a.weiIn ?? 0n
    const weiB = b.weiIn ?? 0n
    // Highest weiIn comes first
    return weiB > weiA ? 1 : weiB < weiA ? -1 : 0
  })

  // Slice the top three coins
  const topThree = sortedCoins.slice(0, 3)

  // Map to your CoinData interface and assign rank
  // Since you don't want to display the actual weiIn value, set score to 0 (or another placeholder)
  const coinData: CoinData[] = topThree.map((coin, index) => ({
    id: coin.id,
    rank: index + 1,
    name: coin.name,
    score: 0, // We don't display weiIn, so score is set to 0
    imageUrl: coin.imageUrl || 'https://via.placeholder.com/100',
    symbol: coin.symbol,
  }))

  // Rearrange for podium layout (for desktop, e.g. Rank 2, Rank 1, Rank 3)
  const podiumOrder =
    coinData.length >= 3
      ? [
          coinData.find((c) => c.rank === 2)!,
          coinData.find((c) => c.rank === 1)!,
          coinData.find((c) => c.rank === 3)!,
        ]
      : coinData

  console.log('koth coindata', coinData)
  console.log('podium', podiumOrder)
  if (isDesktop) {
    return (
      <Box
        sx={{
          padding: '2rem',
          backgroundColor: 'var(--darkBlue)',
          borderRadius: '12px',
          margin: '2rem 0',
          textAlign: 'center',
          width: { md: '60%', lg: '60%', xl: '30%' },
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
    // Mobile layout
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

        {coinData.map((coin) => (
          <Box
            key={coin.rank}
            sx={{
              mb: 1,
              backgroundColor: 'var(--midBlue)',
              height: coin.rank === 1 ? '100px' : '50px',
              width: coin.rank === 1 ? '100%' : '75%',
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'start',
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
