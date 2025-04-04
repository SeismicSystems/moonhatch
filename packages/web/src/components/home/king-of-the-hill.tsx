import { useNavigate } from 'react-router-dom'

import KOTHBox, { CoinData } from '@/components/home/koth-box'
import { Box, Typography, useMediaQuery } from '@mui/material'

interface KingOfTheHillSectionProps {
  // @ts-expect-error this is fine
  coins: Coin[]
}

export default function KingOfTheHillSection({
  coins,
}: KingOfTheHillSectionProps) {
  const isDesktop = useMediaQuery('(min-width: 780px)')
  const sortedCoins = [...coins].sort((a, b) => {
    const weiA = a.weiIn ?? 0n
    const weiB = b.weiIn ?? 0n
    return weiB > weiA ? 1 : weiB < weiA ? -1 : 0
  })
  const navigate = useNavigate()

  const topThree = sortedCoins.slice(0, 3)

  const coinData: CoinData[] = topThree.map((coin, index) => ({
    rank: index + 1,
    score: 0,
    ...coin,
  }))

  const podiumOrder =
    coinData.length >= 3
      ? [
          coinData.find((c) => c.rank === 2)!,
          coinData.find((c) => c.rank === 1)!,
          coinData.find((c) => c.rank === 3)!,
        ]
      : coinData

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
          KINGS OF THE CURVE{' '}
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
            <Box
              onClick={() => navigate(`/coins/${coin.id}`)}
              key={coin.id}
              style={{ cursor: 'pointer' }}
            >
              <KOTHBox key={coin.id} coin={coin} />
            </Box>
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
            key={coin.id}
            sx={{
              mb: 1,
              backgroundColor: 'var(--midBlue)',
              height: coin.rank === 1 ? '100px' : '50px',
              width: coin.rank === 1 ? '100%' : '75%',
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'start',
              alignItems: 'center',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              gap: 2,
            }}
            onClick={() => navigate(`/coins/${coin.id}`)}
            style={{ cursor: 'pointer' }}
          >
            <KOTHBox coin={coin} />
          </Box>
        ))}
      </Box>
    )
  }
}
