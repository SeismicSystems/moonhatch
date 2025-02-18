import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useShieldedWallet } from 'seismic-react'
import { parseEther } from 'viem'

import { useContract } from '@/hooks/useContract'
import { useFetchCoin } from '@/hooks/useFetchCoin'
import type { Coin } from '@/types/coin'
import LockIcon from '@mui/icons-material/Lock'
import { Box, Typography } from '@mui/material'

import NavBar from '../NavBar'
import { Candles } from '../chart/Candles'
import CoinInfoDetails from '../coin-detail/coin-info-details'
import TradeSection from '../coin-detail/trade-section'
import CoinSocials from './coin-social'

const LOCAL_STORAGE_KEY_PREFIX = 'weiIn_coin_'

const CoinDetail: React.FC = () => {
  const { coinId } = useParams<{ coinId: string }>()
  const { fetchCoin, loaded, loading, error } = useFetchCoin()
  const { publicClient, walletClient } = useShieldedWallet()
  const { contract } = useContract()

  const [coin, setCoin] = useState<Coin | null>(null)
  const [weiIn, setWeiIn] = useState<bigint | null>(null)
  const [loadingEthIn, setLoadingEthIn] = useState(false)
  const [buyAmount, setBuyAmount] = useState<string>('')
  const [isBuying, setIsBuying] = useState(false)
  const [buyError, setBuyError] = useState<string | null>(null)

  // Modal state for purchase warnings
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMessage, setModalMessage] = useState('')

  useEffect(() => {
    const cachedWei = localStorage.getItem(
      `${LOCAL_STORAGE_KEY_PREFIX}${coinId}`
    )
    if (cachedWei) setWeiIn(BigInt(cachedWei))
  }, [coinId])

  useEffect(
    () => {
      if (!loaded || !coinId) return

      console.log(`coinId = ${coinId}`)

      fetchCoin(BigInt(coinId))
        .then((foundCoin) => setCoin(foundCoin || null))
        .catch((err) => console.error('Error fetching coin:', err))
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [loaded, coinId]
  )

  // useEffect(() => {
  //   if (!coinId || !contract) return

  // const fetchGraduatedStatus = async () => {
  //   try {
  //     const updatedCoin = await fetchCoin(BigInt(coinId))
  //     setCoin(updatedCoin || null)
  //   } catch (err) {
  //     console.error('Error fetching graduated status:', err)
  //   }
  // }

  // const intervalId = setInterval(fetchGraduatedStatus, 5000) // Poll every 5 seconds

  //   return () => clearInterval(intervalId) // Cleanup on unmount
  // }, [coinId, contract, fetchCoin])

  /**
   * Fetch the ETH balance (weiIn) for non-graduated coins.
   */

  const viewEthIn = async () => {
    if (!walletClient || !contract || !coin || loadingEthIn) return

    setLoadingEthIn(true)
    try {
      const localStorageKey = `${LOCAL_STORAGE_KEY_PREFIX}${coin.id}`
      const cachedWei = localStorage.getItem(localStorageKey)

      if (cachedWei) {
        setWeiIn(BigInt(cachedWei))
      } else {
        const weisBought = (await contract.read.getWeiIn([coin.id])) as bigint
        localStorage.setItem(localStorageKey, weisBought.toString())
        setWeiIn(weisBought)
      }
    } catch (err) {
      console.error('Error fetching ethIn:', err)
      setWeiIn(null) // Changed from 5 to null
    } finally {
      setLoadingEthIn(false)
    }
  }

  const refreshWeiIn = async () => {
    if (!walletClient || !contract || !coin || loadingEthIn) return

    setLoadingEthIn(true)
    try {
      const localStorageKey = `${LOCAL_STORAGE_KEY_PREFIX}${coin.id}`
      const weisBought = (await contract.read.getWeiIn([coin.id])) as bigint

      localStorage.setItem(localStorageKey, weisBought.toString())
      setWeiIn(weisBought)
    } catch (err) {
      console.error('Error refreshing weiIn:', err)
    } finally {
      setLoadingEthIn(false)
    }
  }

  const handleBuy = async () => {
    setBuyError(null)

    if (!publicClient || !walletClient || !contract || !coin || !buyAmount) {
      setBuyError('Required data is missing.')
      return
    }

    const amountInWei = parseEther(buyAmount, 'wei')
    const maxWei = parseEther('1', 'wei') // 1 ETH limit
    const localStorageKey = `${LOCAL_STORAGE_KEY_PREFIX}${coin.id}`
    const existingWei = localStorage.getItem(localStorageKey)
    const existingWeiBigInt = existingWei ? BigInt(existingWei) : BigInt(0)

    // 🚨 Check isGraduated instead of enforcing a strict 1 ETH limit
    // Left > maxWei for now but eventually will want this to only check if graduated
    if (coin.graduated || amountInWei + existingWeiBigInt > maxWei) {
      setModalMessage(
        'This coin has graduated. Purchases are no longer allowed.'
      )
      setModalOpen(true)
      return
    }

    try {
      if (isBuying) {
        setBuyError('Already buying')
        return
      }
      const balance = await publicClient.getBalance({
        address: walletClient.account.address,
      })

      if (amountInWei > BigInt(balance)) {
        setBuyError('Insufficient balance.')
        return
      }

      setIsBuying(true)
      const hash = await contract.write.buy([coin.id], {
        gas: 1_000_000,
        value: amountInWei,
      })

      console.log(`✅ Transaction sent! Hash: ${hash}`)

      const newTotalWei = existingWeiBigInt + amountInWei
      localStorage.setItem(localStorageKey, newTotalWei.toString())
      setWeiIn(newTotalWei)
      setBuyAmount('') // Clear input after success
    } catch (err) {
      console.error('❌ Transaction Failed:', err)
      setBuyError(
        `Transaction failed: ${err instanceof Error ? err.message : 'Unknown error'}`
      )
      setBuyError(
        `Transaction failed: ${err instanceof Error ? err.message : 'Unknown error'}`
      )
    } finally {
      setIsBuying(false)
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  if (!coin) return <div>Coin not found.</div>

  return (
    <>
      <div className="mb-8">
        <NavBar />
      </div>
      <div className="flex w-full lg:justify-around xl:justify-around  items-center  lg:pr-24 xl:pr-60  lg:-pl-24 xl:gap-60  lg:gap-12 flex-col lg:flex-row mb-24">
        <Box
          sx={{
            width: { xs: '350px', sm: '550px', md: '450px', lg: '550px' },
            height: { xs: 'auto', sm: 'auto', md: '710px', lg: '710px' },

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
          <div className="coin-socials-container -mb-8 mt-6">
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
        </Box>
        <div className="status-icon-container bg-[var(--bgColor)] flex justify-center  items-center">
          {coin.graduated && coin.deployedPool ? (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '350px',
                width: '350px',

                border: 1,
                '& .chart-container': {
                  width: '100%',
                  height: '100%',
                },
              }}
            >
              <div className="-mt-24 md:mt-12 lg:mt-0">
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
                border: 1,

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
              {/* 16px */}
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

export default CoinDetail
