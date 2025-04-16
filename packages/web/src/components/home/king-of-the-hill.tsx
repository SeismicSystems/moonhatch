import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

import KOTHBox, { CoinData } from '@/components/home/koth-box'
import { selectAllCoins } from '@/store/slice'
import { Coin } from '@/types/coin'
import { Box, Typography, useMediaQuery } from '@mui/material'

interface KingOfTheHillSectionProps {
  coins: Coin[]
}

export default function KingOfTheHillSection({
  coins,
}: KingOfTheHillSectionProps) {
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const navigate = useNavigate()
  const [topCoins, setTopCoins] = useState<CoinData[]>([])

  const storeCoins = useSelector(selectAllCoins)

  useEffect(() => {
    if (coins && coins.length > 0) {
      const scoredCoins = calculateKOTHScores(coins)
      setTopCoins(scoredCoins.slice(0, 3))
    }
    // Otherwise get coins from Redux store
    else if (Object.keys(storeCoins).length > 0) {
      const coinsList = Object.values(storeCoins)
      const scoredCoins = calculateKOTHScores(coinsList)
      setTopCoins(scoredCoins.slice(0, 3))
    }
  }, [coins, storeCoins])

  const calculateKOTHScores = (coinsList: Coin[]): CoinData[] => {
    return [...coinsList]
      .map((coin) => {
        const weiIn = BigInt(coin.weiIn || '0')

        // Calculate factors for the formula
        const graduatedMult = coin.graduated ? 0 : 1
        const imageMult = coin.imageUrl ? 3 : 1

        let socialCount = 0
        if (coin.website) socialCount++
        if (coin.twitter) socialCount++
        if (coin.telegram) socialCount++
        const socialMult = 1 + socialCount / 3

        const coinAgeMs = Date.now() - new Date(coin.createdAt).getTime()
        const ageMinutes = coinAgeMs / (1000 * 60)
        const timeFactor = Math.log(2 + Math.max(0, ageMinutes))

        const weiInValue = Number(weiIn) / 10 ** 10
        const score =
          (graduatedMult * imageMult * socialMult * weiInValue) / timeFactor

        return {
          ...coin,
          score,
          rank: 0,
        }
      })
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .map((coin, index) => ({
        ...coin,
        rank: index + 1,
      }))
  }

  if (topCoins.length === 0) {
    return (
      <Box sx={{ p: 4, color: 'var(--creamWhite)', textAlign: 'center' }}>
        <Typography>No coins found for the leaderboard.</Typography>
      </Box>
    )
  }

  const podiumOrder =
    topCoins.length >= 3
      ? [
          topCoins.find((c) => c.rank === 2)!,
          topCoins.find((c) => c.rank === 1)!,
          topCoins.find((c) => c.rank === 3)!,
        ]
      : topCoins

  if (isDesktop) {
    return (
      <Box
        sx={{
          padding: '2rem',
          backgroundColor: 'var(--darkBlue)',
          borderRadius: '12px',
          margin: '2rem 0',
          textAlign: 'center',
          width: { md: '60%', lg: '50%', xl: '40%' },
          height: '40dvh',
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

        {topCoins.map((coin) => (
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
