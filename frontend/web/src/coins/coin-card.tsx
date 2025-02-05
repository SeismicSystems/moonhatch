import React, { useEffect, useState } from 'react'
import { useShieldedWallet } from 'seismic-react'
import { formatEther, parseEther } from 'viem'

import { usePumpContract } from '../hooks/contract'
import { Coin } from '../types/coin'
import { formatRelativeTime } from '../util'
import CoinImage from './coin-image'
import SocialLink from './social-link'

interface CoinCardProps {
  coin: Coin
}

const CoinCard: React.FC<CoinCardProps> = ({ coin }) => {
  // Our coin.createdAt is in seconds; convert to ms.
  const createdTimestamp = coin.createdAt * 1000
  const relativeTime = formatRelativeTime(createdTimestamp)

  // Local state for the buy input, error message and loading indicator.
  const [buyAmount, setBuyAmount] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  const { publicClient, walletClient } = useShieldedWallet()
  const { contract } = usePumpContract()

  const [loadingEthIn, setLoadingEthIn] = useState(false)
  const [weiIn, setWeiIn] = useState<bigint | null>(null)

  const handleBuy = async () => {
    setError(null)
    if (!publicClient || !walletClient) {
      setError('Clients not loaded')
      return
    }
    if (!contract) {
      setError('client not loaded')
      return
    }
    // Check that the input is a valid number
    if (!buyAmount || isNaN(Number(buyAmount))) {
      setError('Please enter a valid amount')
      return
    }
    // Convert the input amount (ETH) to Wei (bigint)
    const amountInWei = parseEther(buyAmount, 'wei')
    try {
      // Refresh the balance just before sending the transaction.
      const balance = await publicClient.getBalance({
        address: walletClient.account.address,
      })

      if (amountInWei > BigInt(balance)) {
        setError('Insufficient balance')
        return
      }

      setLoading(true)
      // Execute the contract call:
      const hash = await contract.write.buy([coin.id], {
        gas: 1_000_000,
        value: amountInWei,
      })
      console.log(`Tx hash: ${hash}`)
      // Optionally, clear the input or give a success message:
      setBuyAmount('')
    } catch (err) {
      // @ts-expect-error: it's an error
      setError(`Transaction failed: ${err.message || err}`)
    } finally {
      setLoading(false)
    }
  }

  const viewEthIn = async () => {
    // TODO: read/write this to browser's local storage once they read it once
    // this map should be [chainId] => [coinId] => weiIn
    if (!walletClient || !contract) {
      return
    }
    if (loadingEthIn) {
      return
    }
    setLoadingEthIn(true)

    // @ts-expect-error: it gives back a bigint
    const weisBought: bigint = await contract.read.getWeiIn([coin.id])
    setWeiIn(weisBought)

    setLoadingEthIn(false)
  }

  useEffect(() => {}, [coin, walletClient])

  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow flex gap-4">
      {/* Left panel: Coin details */}
      <div className="flex-1">
        <div className="flex items-start gap-4">
          {coin.imageUrl && <CoinImage src={coin.imageUrl} name={coin.name} />}
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{coin.name}</h3>
                <span className="text-sm text-gray-500">{coin.symbol}</span>
              </div>
              <span className="text-xs text-gray-400">{relativeTime}</span>
            </div>

            <p className="mt-2 text-gray-600 text-sm">{coin.description}</p>

            <div className="mt-3 flex flex-wrap gap-2">
              {coin.website && (
                <SocialLink
                  href={coin.website}
                  type="website"
                  label="Website"
                />
              )}
              {coin.telegram && (
                <SocialLink
                  href={coin.telegram}
                  type="telegram"
                  label="Telegram"
                />
              )}
              {coin.twitter && (
                <SocialLink href={coin.twitter} type="twitter" label="𝕏" />
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Right panel: BUY section */}
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
      <div className="flex flex-col items-center justify-center border-l pl-4">
        <input
          type="text"
          value={buyAmount}
          onChange={(e) => setBuyAmount(e.target.value)}
          placeholder="ETH"
          className="mb-2 p-2 border rounded w-20 text-center"
        />
        <button
          onClick={handleBuy}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          {loading ? 'Processing...' : 'BUY'}
        </button>
        {error && <div className="mt-2 text-red-500 text-xs">{error}</div>}
      </div>
    </div>
  )
}

export default CoinCard
