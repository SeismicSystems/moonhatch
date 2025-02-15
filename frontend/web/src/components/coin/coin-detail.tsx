import { HomeIcon } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { useShieldedWallet } from 'seismic-react'
import { formatEther, parseEther } from 'viem'

import { useContract } from '@/hooks/useContract'
import { useFetchCoin } from '@/hooks/useFetchCoin'
import type { Coin } from '@/types/coin'
import LockIcon from '@mui/icons-material/Lock'

import NavBar from '../NavBar'
import CoinInfoDetails from '../coin-detail/coin-info-details'
import TradeSection from '../coin-detail/trade-section'

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

  useEffect(() => {
    if (!loaded || !coinId) return

    console.log(`coinId = ${coinId}`)

    fetchCoin(BigInt(coinId))
      .then((foundCoin) => setCoin(foundCoin || null))
      .catch((err) => console.error('Error fetching coin:', err))
  }, [loaded, coinId])

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
      <div className="page-container bg-[var(--darkBlue)] rounded-3xl  w-[350px] max-w-full mx-auto p-4 h-overflow-x-hidden overflow-y-hidden">
        <CoinInfoDetails coin={{ ...coin, id: coin.id }} />
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
      </div>
      <div className="status-icon-container bg-[var(--bgColor)] flex justify-center mt-4">
        {coin.graduated ? (
          <div className="chart-container  flex justify-center items-center h-[350px] w-[350px] border">
            CHART
          </div>
        ) : (
          <div className="chart-container  flex justify-center items-center h-[350px] w-[350px] border">
            <div className="lock-container w-[130px] border-2 border-red-500 rounded-full p-4">
              <LockIcon
                className="lock-icon text-red-500 animate-pulse"
                style={{ fontSize: '96px' }}
              />
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default CoinDetail
