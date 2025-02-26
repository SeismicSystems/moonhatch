import React from 'react'
import { Box, Typography } from '@mui/material'

import { formatRelativeTime } from '@/util'

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
  const createdTimestamp = new Date(coin.createdAt + 'Z').getTime()
  const relativeTime = formatRelativeTime(createdTimestamp)

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',

          '& .left-column': {
            width: { xs: '270px', sm: '450px', md: '450px', lg: '450px' },
            display: 'flex',
            paddingBottom: 2,
            alignItems: 'center',
            justifyContent: 'start',
            gap: 2,
            borderRadius: '16px',
            backgroundColor: 'var(--darkBlue)',
          },
          '& .img-container': {
            flexShrink: 0,
          },
          '& img': {
            width: { xs: '100px', sm: '200px', md: '200px', lg: '200px' },
            height: { xs: '100px', sm: '200px', md: '200px', lg: '200px' },
            flexShrink: 0,
            marginRight: { xs: 0, sm: 2, md: 2, lg: 2 },
            borderRadius: '8px',
            objectFit: 'cover',
          },
          '& .right-column': {
            width: {
              xs: '100px',
              sm: '250px',
              md: '300px',
              lg: '350px',
            },
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            textAlign: 'left',
            '& .coin-name': {
              fontSize: { xs: '24px', sm: '34px', md: '24px', lg: '30px' },
              color: 'var(--creamWhite)',
            },
            '& .coin-symbol': {
              fontSize: { xs: '14px', sm: '28px', md: '18px', lg: '20px' },
              color: 'lightgreen',
            },
            '& .coin-author, & .coin-age': {
              fontSize: {
                xs: '0.75rem',
                sm: '1rem',
                md: '1rem',
                lg: '1rem',
              },
            },
          },
        }}
      >
        <div className="left-column">
          <div className=" img-container w-auto h-auto aspect-square ">
            <img
              src={coin.imageUrl ?? FALLBACK_COIN_IMAGE_URL}
              alt="Coin Logo"
            />
          </div>
          <div className="right-column">
            <Typography
              variant="h4"
              component="h4"
              sx={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',

                color: 'var(--creamWhite)',
              }}
            >
              <div className="coin-name">{coin.name.toUpperCase()}</div>
            </Typography>
            <Typography
              noWrap
              variant="h4"
              component="h4"
              sx={{
                textOverflow: 'ellipsis',

                color: 'var(--creamWhite)',
              }}
            >
              <div className="coin-symbol">
                $:{coin.symbol.toUpperCase().slice(0, 8)}
              </div>
            </Typography>
            <div className="coin-author">
              <div className="text-orange-300">AUTHOR:</div>
              <div className="text-orange-200">
                {coin.creator?.toString().slice(0, 4)}...
                {coin.creator?.toString().slice(-4) || 'N/A'}
              </div>
            </div>
            <div className="coin-age text-orange-100">AGE::{relativeTime}</div>
          </div>
        </div>
      </Box>

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
        <div className="coin-desc  mt-2 flex flex-col items-center justify-center">
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
