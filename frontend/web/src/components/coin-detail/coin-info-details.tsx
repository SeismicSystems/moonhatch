import React from 'react'

import CoinDescriptionContainer from '@/components/coin-detail/coin-desc-container'
import CoinImageComponent from '@/components/coin-detail/coin-image-component'

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
    decimals: bigint | number
    graduated: boolean
    creator: { toString: () => string }
    description: string
    twitter: string
    website: string
    telegram: string
  }
}

const CoinInfoDetails: React.FC<CoinInfoDetailsProps> = ({ coin }) => {
  return (
    <>
      <CoinImageComponent coin={coin} />
      <CoinDescriptionContainer coin={coin} />
    </>
  )
}

export default CoinInfoDetails
