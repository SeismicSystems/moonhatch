import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useShieldedWallet } from 'seismic-react'
import { formatEther, parseEther } from 'viem'

import { useContract } from '@/hooks/useContract'
import { useFetchCoin } from '@/hooks/useFetchCoin'
import type { Coin } from '@/types/coin'
import { Box, Modal } from '@mui/material'

const LOCAL_STORAGE_KEY_PREFIX = 'weiIn_coin_'

const CoinDetail: React.FC = () => {
  const { coinId } = useParams<{ coinId: string }>()
  const { fetchCoins, loaded, loading, error } = useFetchCoin()
  const { publicClient, walletClient } = useShieldedWallet()
  const { contract } = useContract()

  const [coin, setCoin] = useState<Coin | null>(null)
  const [weiIn, setWeiIn] = useState<bigint | null>(null)
  const [loadingEthIn, setLoadingEthIn] = useState(false)
  const [buyAmount, setBuyAmount] = useState<string>('')
  const [isBuying, setIsBuying] = useState(false)
  const [buyError, setBuyError] = useState<string | null>(null)

  // Modal state for ETH purchase limit warning
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMessage, setModalMessage] = useState('')

  /**
   * Load cached balance from local storage when component mounts.
   */
  useEffect(() => {
    const cachedWei = localStorage.getItem(
      `${LOCAL_STORAGE_KEY_PREFIX}${coinId}`
    )
    if (cachedWei) setWeiIn(BigInt(cachedWei))
  }, [coinId])

  /**
   * Fetch coin details when component loads.
   */
  useEffect(() => {
    if (!loaded) return
    fetchCoins()
      .then((coins) => {
        const id = Number(coinId)
        setCoin(coins.find((c) => c.id === BigInt(id)) || null)
      })
      .catch((err) => console.error('Error fetching coins:', err))
  }, [loaded, coinId])

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
      setWeiIn(BigInt(5)) // Fallback value
    } finally {
      setLoadingEthIn(false)
    }
  }

  /**
   * Refresh balance by fetching the latest value from blockchain.
   */
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

  /**
   * Handle Buy Transaction with ETH purchase limit enforcement.
   */
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

    // 🚨 Prevent users from buying more than 1 ETH in total.
    if (amountInWei > maxWei || existingWeiBigInt + amountInWei > maxWei) {
      setModalMessage('You cannot buy more than 1 ETH in total.')
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
      setBuyError(`Transaction failed: ${err.message || 'Unknown error'}`)
    } finally {
      setIsBuying(false)
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  if (!coin) return <div>Coin not found.</div>

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Display coin details */}
      <div className="coin-name">name - {coin.name}</div>
      <div className="coin-ticker">ticker - {coin.symbol}</div>
      <div className="coin-address">
        address - {coin.contractAddress.toString()}
      </div>
      <div className="coin-created-at">
        created-at - {coin.createdAt.toString()}
      </div>
      <div className="coin-supply">supply - {coin.supply.toString()}</div>
      <div className="coin-graduated">graduated - {coin.graduated}</div>
      <div className="coin-image">
        <img
          src="https://seismic-public-assets.s3.us-east-1.amazonaws.com/seismic-logo-light.png"
          alt="Coin Logo"
        />
      </div>

      {/* View Balance Section */}
      <Box
        height="100px"
        width="100px"
        sx={{ background: 'black', p: 1, mt: 2 }}
      >
        <div className="text-white">VIEW BALANCE</div>
        {coin.graduated ? (
          <button
            className="text-white"
            onClick={() => console.log('View Balance (0)')}
          >
            View Balance (0)
          </button>
        ) : (
          <>
            {weiIn !== null ? (
              <div className="text-green-600 font-bold">
                {formatEther(weiIn)}
              </div>
            ) : loadingEthIn ? (
              <div className="text-gray-500 text-sm">Waiting...</div>
            ) : (
              <button
                className="bg-blue-600 text-white py-2 px-4 rounded"
                onClick={viewEthIn}
              >
                View ETH
              </button>
            )}
            <button
              className="bg-blue-600 text-white py-2 px-4 rounded"
              onClick={refreshWeiIn}
            >
              Refresh WeiIn
            </button>
          </>
        )}
      </Box>

      {/* Buy Section */}
      {!coin.graduated && (
        <div className="trade my-4">
          <input
            type="text"
            value={buyAmount}
            onChange={(e) => setBuyAmount(e.target.value)}
            placeholder="Enter amount (max 1 ETH)"
            className="border border-gray-300 p-2 rounded mb-2"
          />
          {buyError && <p className="text-red-500 text-sm">{buyError}</p>}
          <button
            className="bg-green-500 text-white px-4 py-2 rounded"
            onClick={handleBuy}
          >
            Buy
          </button>
        </div>
      )}

      {/* Modal for ETH Limit Warning */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Box className="p-4 bg-white border rounded shadow-lg text-center">
          <h2 className="text-lg font-bold">Warning</h2>
          <p>{modalMessage}</p>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
            onClick={() => setModalOpen(false)}
          >
            OK
          </button>
        </Box>
      </Modal>
    </div>
  )
}

export default CoinDetail
