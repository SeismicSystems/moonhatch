import React from 'react'

import CoinDescriptionContainer from '@/components/coin-detail/coin-desc-container'
import CoinImageComponent from '@/components/coin-detail/coin-image-component'
import { Coin } from '@/types/coin'

export const FALLBACK_COIN_IMAGE_URL =
  'https://seismic-public-assets.s3.us-east-1.amazonaws.com/seismic-logo-light.png'

const CoinInfoDetails: React.FC<{ coin: Coin }> = ({ coin }) => {
  return (
    <>
      <CoinImageComponent coin={coin} />
      <CoinDescriptionContainer coin={coin} />
    </>
  )
}

export default CoinInfoDetails
