import React, { useEffect, useState } from 'react'
import { useShieldedWallet } from 'seismic-react'
import { parseEther } from 'viem'

import { useContract } from '@/hooks/useContract'
import { Coin } from '@/types/coin'
import { formatRelativeTime } from '@/util'
import SocialLink from '@components/coin/social-link'

interface CoinCardProps {
  coin: Coin
}

const CoinCard: React.FC<CoinCardProps> = ({ coin }) => {
  //implement Z to correct timezone issue
  const createdTimestamp = coin.createdAt
  const relativeTime = formatRelativeTime(createdTimestamp)
  const [buyAmount, setBuyAmount] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  const { publicClient, walletClient } = useShieldedWallet()
  const { contract } = useContract()

  const [loadingEthIn, setLoadingEthIn] = useState(false)
  const [weiIn, setWeiIn] = useState<bigint | null>(null)

  const defaultImage =
    'https://seismic-public-assets.s3.us-east-1.amazonaws.com/seismic-logo-light.png'

  const [imgSrc, setImgSrc] = useState(coin.imageUrl)

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
    <div className="bg-[var(--darkBlue)] rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow flex gap-4">
      {/* Left panel: Coin details */}
      <div className="flex-1">
        <div className="flex items-center gap-4 justify-center">
          {/* Wrap the image in a flex container for perfect centering */}
          <div className="w-24 h-24 flex items-center justify-center">
            <img
              src={imgSrc}
              alt="Coin Logo"
              className="rounded-lg w-full h-full object-cover"
              onError={() => {
                if (imgSrc !== defaultImage) {
                  setImgSrc(defaultImage)
                }
              }}
            />
          </div>
          <div className="flex-1">
            <div className="flex items-start">
              <div className="text-left">
                <div className="flex">
                  <h3 className="text-lg -mb-2 text-[var(--creamWhite)]">
                    {coin.name.toUpperCase()}
                  </h3>
                  <div className=" self-end ml-1 text-[8px] text-[var(--lightBlue)]">
                    {relativeTime}
                  </div>
                </div>
                <span className="text-sm text-[var(--midBlue)]">
                  ${coin.symbol.toUpperCase()}
                </span>
                <div className="desc-container w-5/6">
                  <p className=" text-sm -mb-2  text-[var(--lightBlue)]">
                    desc:
                  </p>
                  <p className="mt-2 text-[var(--lightBlue)] text-xs">
                    {coin.description.length > 50
                      ? `${coin.description.substring(0, 50)}...`
                      : coin.description}
                  </p>
                </div>
              </div>
            </div>
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
    </div>
  )
}
export default CoinCard
