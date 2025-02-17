import React from 'react'

import { formatRelativeTime } from '@/util'

interface CoinInfoDetailsProps {
  coin: {
    id: bigint
    name: string
    symbol: string
    contractAddress: { toString: () => string }
    image_url?: string
    created_at: { toString: () => string }
    supply: { toString: () => string }
    graduated: boolean
    creator: { toString: () => string }
    description: string
  }
}

const CoinInfoDetails: React.FC<CoinInfoDetailsProps> = ({ coin }) => {

  const createdTimestamp = new Date(coin.created_at + 'Z').getTime()
  const relativeTime = formatRelativeTime(createdTimestamp)

  return (
    <>
      <div className="flex justify-center">
        <div className="left-column bg-[var(--darkBlue)] w-[300px] p-4 flex items-center justify-center space-x-4 rounded-2xl">
          <div className="w-24 h-24">
            <img
              src={
                coin.image_url
                  ? coin.image_url
                  : 'https://seismic-public-assets.s3.us-east-1.amazonaws.com/seismic-logo-light.png'
              }
              alt="Coin Logo"
              className="rounded-lg w-full h-full object-cover"
            />
          </div>
          <div className="right-column flex flex-col text-left">
            <div className="text-[18px] text-[var(--creamWhite)]">
              {coin.name}
            </div>
            <div className="text-[16px] text-[var(--creamWhite)] ">
              $:{coin.symbol}
            </div>
            <div className=" text-[var(--lightBlue)] text-xs">
              AUTHOR: {coin.creator?.toString().slice(0, 4)}...
              {coin.creator?.toString().slice(-4) || 'N/A'}
            </div>
            <div className="text-[var(--lightBlue)] text-xs">
              TIMESTAMP:{relativeTime}
            </div>
          </div>
        </div>
      </div>
      <div className="text-[var(--lightBlue)] flex flex-col text-xs">
        <div className="coin-desc mb-2">"{coin.description}"</div>
      </div>
    </>
  )
}

export default CoinInfoDetails
