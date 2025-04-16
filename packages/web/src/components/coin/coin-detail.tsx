import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'

import { fetchCoinByIdAction } from '@/api/dispatch'
import NavBar from '@/components/NavBar'
import { Candles } from '@/components/chart/Candles'
import CoinInfoDetails from '@/components/coin-detail/coin-info-details'
import TradeSection from '@/components/coin-detail/trade-section'
import CoinSocials from '@/components/coin/coin-social'
import { useToastNotifications } from '@/hooks/useToastNotifications'
import NotFound from '@/pages/NotFound'
import { selectCoinById } from '@/store/slice'
import { AppDispatch } from '@/store/store'
import type { Coin } from '@/types/coin'
import LockIcon from '@mui/icons-material/Lock'
import { Box, Typography } from '@mui/material'

const CoinDetailGraph: React.FC<{ coin: Coin }> = ({ coin }) => {
  return (
    <>
      {coin.graduated && coin.deployedPool ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: 'auto',
            border: { lg: '2px solid var(--creamWhite)', xs: 'none' },
            borderRadius: '10px',
          }}
        >
          <div className="-mt-32 mb-8 md:mb-0 md:-mt-0">
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
            height: '20rem',

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

const CoinDetailContent: React.FC<{ coinId: string }> = ({ coinId }) => {
  const coin = useSelector(selectCoinById(coinId))
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    if (!coin) {
      dispatch(fetchCoinByIdAction(Number(coinId)))
    }
  }, [coinId, coin, dispatch])

  if (!coin) return <div>Coin not found.</div>
  if (coin.hidden) {
    return <NotFound />
  }

  return (
    <>
      <div className="flex flex-col justify-center items-center">
        <NavBar />
        <Box
          sx={{
            display: 'flex',
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: { xs: 'column', lg: 'row' },
            gap: '3rem',
            maxWidth: 'screen-xl',
            py: { lg: 2 },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              width: {
                xs: '90%',
                sm: '90%',
                md: '80%',
                lg: '70%',
                xl: '50%',
              },
              maxWidth: '100%',
              marginTop: 4,
              marginLeft: { xs: 0, lg: 4, xl: 16 },

              p: 4,
              border: '2px solid var(--creamWhite)',
              bgcolor: 'var(--darkBlue)',
              borderRadius: '24px',

              mb: { xs: 0, sm: 4, md: 0 },
            }}
          >
            <CoinInfoDetails coin={coin} />
            <TradeSection coin={coin} />
            {(coin.twitter || coin.telegram || coin.website) && (
              <div className="coin-socials-container  -mt-12 lg:mt-20 -mb-4">
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
          <div className="status-icon-container lg:mr-8 xl:mr-32 flex justify-center mx-auto items-center ">
            <CoinDetailGraph coin={coin} />
          </div>
        </Box>
      </div>
    </>
  )
}

const CoinDetail: React.FC = () => {
  const { coinId } = useParams<{ coinId: string }>()
  const navigate = useNavigate()
  const { notifyError } = useToastNotifications()

  useEffect(() => {
    if (!coinId) {
      notifyError('Invalid coin ID')
      navigate('/')
    }
  }, [coinId, navigate, notifyError])

  if (!coinId) {
    return <div className="text-red-500">No coin ID</div>
  }
  return <CoinDetailContent coinId={coinId} />
}

export default CoinDetail
