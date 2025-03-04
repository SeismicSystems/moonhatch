import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import NavBar from '@/components/NavBar'
import { Candles } from '@/components/chart/Candles'
import CoinInfoDetails from '@/components/coin-detail/coin-info-details'
import TradeSection from '@/components/coin-detail/trade-section'
import CoinSocials from '@/components/coin/coin-social'
import { useFetchCoin } from '@/hooks/useFetchCoin'
import type { Coin } from '@/types/coin'
import LockIcon from '@mui/icons-material/Lock'
import { Box, Typography } from '@mui/material'

const CoinDetailGraph: React.FC<{ coin: Coin }> = ({ coin }) => {
  return (
    <>
      {coin.graduated && coin.deployedPool ? (
        <Box sx={{ display: 'flex' }}>
          <div className="justify-center items-center">
            <Candles pool={`${coin.deployedPool}`} />
          </div>
        </Box>
      ) : (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '350px',
            width: '350px',
            marginRight: { xs: 0, sm: 0, md: 0, lg: 0, xl: '200%' },
          }}
        >
          <Typography variant="h3" sx={{ mb: 2, color: 'error.main' }}>
            CHART LOCKED UNTIL GRADUATION
          </Typography>
          <div className="lock-container border-2 border-red-500 rounded-full p-4 ">
            <LockIcon className="lock-icon text-red-500 text-[96px] animate-pulse" />
          </div>
        </Box>
      )}
    </>
  )
}

const CoinDetailContent: React.FC<{ coin: Coin }> = ({ coin }) => {
  return (
    <>
      <div className="">
        <NavBar />
      </div>
      <div className="page-container bg-[var(--darkBlue)] flex w-full justify-center items-center = flex-col lg:flex-row gap-12 xl:gap-24 pb-24 max-w-screen lg:px-12 2xl:px-24 lg:py-8">
        <Box
          sx={{
            width: {
              xs: 'auto',
              sm: 'auto', // '550px'
              md: 'auto', // '450px'
              lg: 'auto', // '650px'
              xl: 'auto', // '950px'
            },
            maxWidth: '100%',
            mx: 'auto',
            p: 4,
            // border: 2,
            // borderColor: 'var(--creamWhite)',
            bgcolor: 'var(--darkBlue)',
            borderRadius: '24px',
            overflow: 'hidden',
            mb: { xs: 0, sm: 4, md: 0 },
          }}
        >
          <CoinInfoDetails coin={coin} />
          <TradeSection coin={coin} />
          {(coin.twitter || coin.telegram || coin.website) && (
            <div className="coin-socials-container -mt-12 lg:mt-20 -mb-4">
              <CoinSocials
                coin={{
                  ...coin,
                  id: coin.id,
                  twitter: coin.twitter || '',
                  telegram: coin.telegram || '',
                  website: coin.website || '',
                }}
              />
            </div>
          )}
        </Box>

        <div className="status-icon-container flex justify-center mx-auto items-center">
          <CoinDetailGraph coin={coin} />
        </div>
      </div>
    </>
  )
}

const CoinDetail: React.FC = () => {
  const { coinId } = useParams<{ coinId: string }>()
  const [coin, setCoin] = useState<Coin | null>(null)
  const { fetchCoin, loaded, loading, error } = useFetchCoin()

  useEffect(() => {
    if (!loaded || !coinId) return
    fetchCoin(Number(coinId))
      .then((foundCoin) => setCoin(foundCoin))
      .catch((err) => console.error('Error fetching coin:', err))
  }, [loaded, coinId, fetchCoin])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  if (!coin) return <div>Coin not found.</div>
  return <CoinDetailContent coin={coin} />
}

export default CoinDetail
