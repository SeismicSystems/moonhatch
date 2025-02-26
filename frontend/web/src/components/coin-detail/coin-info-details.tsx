import React from 'react'

import { formatRelativeTime } from '@/util'
import { Box, Typography } from '@mui/material'
import CoinImageComponent from './coin-image-component'

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
      <Box
      sx={{
      display: 'flex',
      flexDirection: 'column',
      color: 'var(--lightBlue)',
      fontSize: '0.75rem',
      '& .coin-desc': {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      marginBottom: 2,
      fontSize: { xs: '1rem', sm: '1rem', md: '1.2rem', lg: '1.4rem' },
      },
      }}
      >
      <div className="coin-desc mt-2 flex flex-col items-center justify-center">
      <div className="flex text-xs xl:text-lg text-orange-300">
      DESCRIPTION:{' '}
      </div>
      <div className="lg:text-lg overflow-hidden text-ellipsis">
      "{coin.description || 'creator did not provide description'}"
      </div>
      </div>
      </Box>
    </>
  )
}

export default CoinInfoDetails
