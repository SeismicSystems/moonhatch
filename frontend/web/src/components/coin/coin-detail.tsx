import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useShieldedWallet } from 'seismic-react'

import { useCoinActions } from '@/hooks/useCoinActions'
import {
  useCoinContract,
  useDexContract,
  usePumpContract,
} from '@/hooks/useContract'
import { useFetchCoin } from '@/hooks/useFetchCoin'
import type { Coin } from '@/types/coin'
import LockIcon from '@mui/icons-material/Lock'
import { Box, Typography } from '@mui/material'

import NavBar from '../NavBar'
import { Candles } from '../chart/Candles'
import CoinInfoDetails from '../coin-detail/coin-info-details'
import TradeSection from '../coin-detail/trade-section'
import CoinSocials from './coin-social'

const REFRESH_COIN_DETAIL_MS = 5_000

const CoinDetailContent: React.FC<{ coin: Coin }> = ({ coin }) => {
  const { contract: coinContract } = useCoinContract(coin.contractAddress)

  const [weiIn, setWeiIn] = useState<bigint | null>(null)
  const [buyError, setBuyError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState<boolean>(false)
  const [modalMessage, setModalMessage] = useState<string>('')

  const { publicClient, walletClient } = useShieldedWallet()
  const { contract: pumpContract } = usePumpContract()
  const { contract: dexContract } = useDexContract()
  const [buyAmount, setBuyAmount] = useState<string>('')

  // if (!walletClient || !publicClient || !pumpContract || !dexContract) {
  //   return <></>
  // }
  const {
    viewEthIn,
    refreshWeiInForGraduated,
    refreshWeiInForNonGraduated,
    handleBuy,
    loadingEthIn,
  } = useCoinActions({
    coin,
    coinContract,
    walletClient,
    publicClient,
    pumpContract,
    dexContract,
    buyAmount,
    setBuyAmount,
    setBuyError,
    setWeiIn,
    sellAmount: '', // pass sell state if needed
    setSellAmount: () => {},
    setSellError: () => {},
  })

  useEffect(() => {
    const cachedWei = localStorage.getItem(`weiIn_coin_${coin.id}`)
    if (cachedWei) setWeiIn(BigInt(cachedWei))
  }, [coin.id])

  const refreshWeiIn = coin.graduated
    ? refreshWeiInForGraduated
    : refreshWeiInForNonGraduated

  return (
    <>
      <div className="mb-8">
        <NavBar />
      </div>

      <div className="flex w-full lg:justify-around xl:justify-around  items-center    flex-col lg:flex-row mb-24 ">
        <Box
          sx={{
            width: { xs: '350px', sm: '550px', md: '450px', lg: '550px' },
            height: { xs: 'auto', sm: 'auto', md: 'auto', lg: 'auto' },
            maxWidth: '100%',
            mx: 'auto',
            p: 4,

            border: 2,
            borderColor: 'var(--creamWhite)',
            bgcolor: 'var(--darkBlue)',
            borderRadius: '24px',
            overflowX: 'hidden',
            overflowY: 'hidden',
            marginBottom: { xs: '0', sm: '50px', md: '0px', lg: '0', xl: '0' },
          }}
        >
          <CoinInfoDetails
            coin={{
              ...coin,
              id: coin.id,
              twitter: coin.twitter || '',
              telegram: coin.telegram || '',
              website: coin.website || '',
            }}
          />
          <TradeSection
            coin={{ ...coin, id: coin.id }}
            weiIn={weiIn}
            loadingEthIn={loadingEthIn}
            viewEthIn={viewEthIn}
            refreshWeiIn={refreshWeiIn}
            buyAmount={buyAmount}
            setBuyAmount={setBuyAmount}
            buyError={buyError}
            handleBuy={handleBuy}
            modalOpen={modalOpen}
            modalMessage={modalMessage}
            setModalOpen={setModalOpen}
          />
          {(coin.twitter || coin.telegram || coin.website) && (
            <div className="coin-socials-container -mt-24 -mb-4 lg:mt-24">
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
        <div className="status-icon-container bg-[var(--bgColor)] flex justify-around  mx-auto  items-center">
          {coin.graduated && coin.deployedPool ? (
            <Box
              sx={{
                display: 'flex',

                '& .chart-container': {},
              }}
            >
              <div className="-mt-24 md:mt-12 lg:mt-0 justify-center items-center ">
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

                '& .lock-container': {
                  width: '130px',
                  border: '2px solid',
                  borderColor: 'error.main',
                  borderRadius: '9999px',
                  padding: '16px',
                },
                '& .lock-icon': {
                  color: 'error.main',
                  fontSize: '96px',
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                },
                '@keyframes pulse': {
                  '0%, 100%': {
                    opacity: 1,
                  },
                  '50%': {
                    opacity: 0.5,
                  },
                },
              }}
            >
              <Typography
                variant="h3"
                component="h3"
                sx={{ mb: 2, color: 'error.main' }}
              >
                CHART LOCKED UNTIL GRADUATION
              </Typography>
              <div className="lock-container">
                <LockIcon className="lock-icon" />
              </div>
            </Box>
          )}
        </div>
      </div>
    </>
  )
}

const CoinDetail: React.FC = () => {
  const { coinId } = useParams<{ coinId: string }>()
  const { fetchCoin, loaded, loading, error } = useFetchCoin()
  const [coin, setCoin] = useState<Coin | null>(null)

  useEffect(() => {
    if (!loaded || !coinId) return

    const refresh = () => {
      fetchCoin(BigInt(coinId))
        .then((foundCoin) => setCoin(foundCoin || null))
        .catch((err) => console.error('Error fetching coin:', err))
    }
    refresh()
    const interval = setInterval(refresh, REFRESH_COIN_DETAIL_MS)
    return () => {
      clearInterval(interval)
    }
  }, [loaded, coinId])

  console.log('coin', coin?.contractAddress)
  // Only call useCoinContract when coin is non-null
  // const coinContract = useCoinContract(coin)
  // console.log('coinContract', coinContract)
  //   console.log('coinContract', coinContract)

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  if (!coin) return <div>Coin not found.</div>
  return <CoinDetailContent coin={coin} />
}

export default CoinDetail
