import React from 'react'

interface CoinInfoDetailsProps {
  coin: {
    name: string
    symbol: string
    contractAddress: { toString: () => string }
    createdAt: { toString: () => string }
    supply: { toString: () => string }
    graduated: boolean
  }
}

const CoinInfoDetails: React.FC<CoinInfoDetailsProps> = ({ coin }) => {
  return (
    <>
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
    </>
  )
}

export default CoinInfoDetails
