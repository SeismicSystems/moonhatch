import React from 'react'

import { formatRelativeTime } from '@/util'
import SocialLink from '@components/coin/social-link'

export const FALLBACK_COIN_IMAGE_URL =
  'https://seismic-public-assets.s3.us-east-1.amazonaws.com/seismic-logo-light.png'

interface CoinInfoDetailsProps {
  coin: {
    id: bigint
    name: string
    symbol: string
    contractAddress: { toString: () => string }
    imageUrl?: string
    createdAt: { toString: () => string }
    supply: { toString: () => string }
    graduated: boolean
    creator: { toString: () => string }
    description: string
    twitter: string
    website: string
    telegram: string
  }
}

const CoinInfoDetails: React.FC<CoinInfoDetailsProps> = ({ coin }) => {
  const createdTimestamp = new Date(coin.createdAt + 'Z').getTime()
  const relativeTime = formatRelativeTime(createdTimestamp)

  return (
    <>
      <div className="flex justify-center">
        <div className="left-column bg-[var(--darkBlue)] w-[300px] p-4 flex items-center justify-center space-x-4 rounded-2xl">
          <div className="w-24 h-24">
            <img
              src={coin.imageUrl ?? FALLBACK_COIN_IMAGE_URL}
              alt="Coin Logo"
              className="rounded-lg w-full h-full object-cover"
            />
          </div>
          <div className="right-column flex flex-col text-left">
            <div className="text-[18px] text-[var(--creamWhite)]">
              {coin.name.toUpperCase()}
            </div>
            <div className="text-[16px] text-[var(--creamWhite)] ">
              $:{coin.symbol.toUpperCase()}
            </div>
            <div className=" text-[var(--lightBlue)] text-xs">
              AUTHOR: {coin.creator?.toString().slice(0, 4)}...
              {coin.creator?.toString().slice(-4) || 'N/A'}
            </div>
            <div className="text-[var(--lightBlue)] text-xs">
              AGE:{relativeTime}
            </div>
          </div>
        </div>
      </div>
      <div className="text-[var(--lightBlue)] flex flex-col text-xs">
        <div className="coin-desc mb-2">
          "{coin.description || 'creator did not provide description'}"
        </div>
      </div>
      <div
        className="flex mt-2 mb-4 items-center justify-center flex-wrap gap-2 text-center"
        onClick={(e) => e.stopPropagation()} // Prevents card click from triggering
      >
        {coin.website && (
          <SocialLink href={coin.website} type="website" label="website" />
        )}
        {coin.telegram && (
          <SocialLink href={coin.telegram} type="telegram" label="telegram" />
        )}
        {coin.twitter && (
          <SocialLink href={coin.twitter} type="twitter" label="twitter" />
        )}
      </div>
    </>
  )
}

export default CoinInfoDetails
