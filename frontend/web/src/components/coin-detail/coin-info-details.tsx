import React from 'react'
import { Box, Typography } from '@mui/material'


import { Box } from '@mui/material'
import CoinImageComponent from './coin-image-component'
import CoinDescriptionContainer from './coin-desc-container'


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
      <CoinImageComponent coin={coin}  />
    <CoinDescriptionContainer coin={coin} />  
    </>
  )
}

export default CoinInfoDetails
