import React from 'react'

interface CoinInfoDetailsProps {
  coin: {
    id: bigint
    name: string
    symbol: string
    contractAddress: { toString: () => string }
    createdAt: { toString: () => string }
    supply: { toString: () => string }
    graduated: boolean
    creator: { toString: () => string }
    description: string
  }
}

const CoinInfoDetails: React.FC<CoinInfoDetailsProps> = ({ coin }) => {
  return (
    <div className=" p-4 flex items-center space-x-4">
      {/* Left Column: Coin Image */}
      <div className="w-48 h-48">
        <img
          src={`https://seismic-public-assets.s3.us-east-1.amazonaws.com/pump/${coin.id.toString()}`}
          alt="Coin Logo"
          className="rounded-lg w-full h-full object-cover"
        />
      </div>

      {/* Right Column: Coin Details */}
      <div className="flex flex-col text-left">
        <div className="text-lg font-bold">{coin.name}</div>
        <div className="text-gray-500">$:{coin.symbol}</div>
        <div className="text-gray-600 text-xs">
          AUTHOR: {coin.creator?.toString().slice(0, 4)}...
          {coin.creator?.toString().slice(-4) || 'N/A'}
        </div>
        <div className="text-gray-600 text-xs">
          TIMESTAMP:{coin.createdAt.toString()}
        </div>
      </div>
    </div>
  )
}

export default CoinInfoDetails
