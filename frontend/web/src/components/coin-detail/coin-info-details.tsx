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
    <>
      <div className="coin-name">name - {coin.name}</div>
      <div className="coin-creator">
        creator - {coin.creator?.toString() || 'N/A'}
      </div>
      <div className="coin-ticker">ticker - {coin.symbol}</div>
      <div className="coin-address">
        address - {coin.contractAddress?.toString() || 'N/A'}
      </div>
      <div className="coin-description">description - {coin.description}</div>
      <div className="coin-created-at">
        created-at - {coin.createdAt.toString()}
      </div>
      <div className="coin-supply">supply - {coin.supply.toString()}</div>
      <div className="coin-graduated">
        graduated - {coin.graduated.toString()}
      </div>
      <div className="coin-image">
        <img
          // TODO: add fallback (e.g. if they don't have an image saved)
          src={`https://seismic-public-assets.s3.us-east-1.amazonaws.com/pump/${coin.id.toString()}`}
          alt="Coin Logo"
        />
      </div>
    </>
  )
}

export default CoinInfoDetails
