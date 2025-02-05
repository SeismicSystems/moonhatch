// CoinDetail.tsx
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useShieldedWallet } from 'seismic-react'
import { formatEther } from 'viem'

import { useContract } from '@/hooks/useContract'
import { useFetchCoin } from '@/hooks/useFetchCoin'
import type { Coin } from '@/types/coin'
import { Box } from '@mui/material'

const CoinDetail: React.FC = () => {
  const { coinId } = useParams<{ coinId: string }>()
  const { fetchCoins, loaded, loading, error } = useFetchCoin()
  const [coin, setCoin] = useState<Coin | null>(null)

  // State for ETH in value (wei)
  const [loadingEthIn, setLoadingEthIn] = useState(false)
  const [weiIn, setWeiIn] = useState<bigint | null>(null)

  const { publicClient, walletClient } = useShieldedWallet()
  const { contract } = useContract()

  useEffect(() => {
    // Wait until the contract is loaded
    if (!loaded) return

    // Fetch all coins and then find the one that matches coinId.
    // Assume coin.id is stored as a bigint.
    fetchCoins()
      .then((coins) => {
        const id = Number(coinId)
        const foundCoin = coins.find((c) => c.id === BigInt(id))
        setCoin(foundCoin || null)
      })
      .catch((err) => {
        console.error('Error fetching coins:', err)
      })
  }, [loaded, coinId])

  // Handler to fetch the ETH balance (weiIn) for non-graduated coins
  const viewEthIn = async () => {
    if (!walletClient || !contract || !coin) return
    if (loadingEthIn) return
    setLoadingEthIn(true)
    try {
      // Assuming contract.read.getWeiIn returns a bigint
      const weisBought: bigint = await contract.read.getWeiIn([coin.id])
      setWeiIn(weisBought)
    } catch (err) {
      console.error('Error fetching ethIn:', err)
    } finally {
      setLoadingEthIn(false)
    }
  }

  // Trade handlers (placeholders)
  // For non-graduated coins: current buy functionality.
  const handleBuy = () => {
    console.log('Non-graduated buy triggered')
    // Insert your current buy functionality here.
  }

  // For graduated coins: placeholder handlers.
  const handleGraduatedBuy = () => {
    console.log('Graduated buy placeholder triggered')
    // Placeholder – replace with actual chain call later.
  }

  const handleSell = () => {
    console.log('Graduated sell placeholder triggered')
    // Placeholder – replace with actual chain call later.
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  if (!coin) return <div>Coin not found.</div>

  return (
    <>
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
            // For graduated coins, show a placeholder View Balance button (hardcoded to 0)
            <button
              onClick={() => console.log('View Balance triggered (0)')}
              className="text-white"
            >
              View Balance (0)
            </button>
          ) : (
            // For non-graduated coins, show ETH balance if available or a button to view it
            <>
              {weiIn !== null ? (
                <div className="text-green-600 font-bold">
                  {formatEther(weiIn, 'wei')} ETH
                </div>
              ) : loadingEthIn ? (
                <div className="text-gray-500 text-sm">Waiting...</div>
              ) : (
                <button
                  onClick={viewEthIn}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  View ETH
                </button>
              )}
            </>
          )}
        </Box>

        {/* Trade Section */}
        <div className="trade my-4">
          {coin.graduated ? (
            // For graduated coins, display both Buy and Sell buttons with placeholder handlers.
            <div className="space-x-2">
              <button
                onClick={handleGraduatedBuy}
                className="bg-green-500 text-white px-4 py-2 rounded"
              >
                Buy
              </button>
              <button
                onClick={handleSell}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Sell
              </button>
            </div>
          ) : (
            // For non-graduated coins, display only the regular Buy button (current functionality).
            <button
              onClick={handleBuy}
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              Buy
            </button>
          )}
        </div>

        {/* Trading View Price Chart Placeholder (for graduated coins) */}

        <div className="trading-view-chart my-4 p-4 border border-gray-300 rounded">
          <p>Trading view price chart will be added here soon.</p>
        </div>
      </div>
    </>
  )
}

export default CoinDetail
