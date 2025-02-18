import React from 'react'

import { formatRelativeTime } from '@/util'
import SocialLink from '@components/coin/social-link'
import { Box, Typography } from '@mui/material'

import CoinSocials from '../coin/coin-social'

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
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',

          '& .left-column': {
            width: { xs: '350px', sm: '450px', md: '450px', lg: '450px' },
            display: 'flex',
            paddingBottom: 2,
            alignItems: 'center',
            justifyContent: 'start',
            gap: 4,
            borderRadius: '16px',
            backgroundColor: 'var(--darkBlue)',
          },
          '& .img-container': {},
          '& img': {
            width: '9rem',
            height: '9rem',
            aspectRatio: '1/1',
            borderRadius: '8px',
            objectFit: 'cover',
          },
          '& .right-column': {
            width: {
              xs: '100px',
              sm: '250px',
              md: '180px',
              lg: '250px',
            },
            display: 'flex',
            flexDirection: 'column',
            textAlign: 'left',
            '& .coin-name': {
              fontSize: { xs: '18px', sm: '18px', md: '24px', lg: '24px' },
              color: 'var(--creamWhite)',
            },
            '& .coin-symbol': {
              fontSize: '16px',
              color: 'var(--creamWhite)',
            },
            '& .coin-author, & .coin-age': {
              color: 'var(--lightBlue)',
              fontSize: {
                xs: '0.75rem',
                sm: '0.75rem',
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
                fontSize: {
                  xs: '1.2rem',
                  sm: '1.2rem',
                  md: '1.5rem',
                  lg: '1.6rem',
                },

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
                fontSize: {
                  xs: '1.2rem',
                  sm: '1.2rem',
                  md: '1.5rem',
                  lg: '1.6rem',
                },
                textOverflow: 'ellipsis',

                color: 'var(--creamWhite)',
              }}
            >
              <div className="coin-symbol">$:{coin.symbol.toUpperCase()}</div>
            </Typography>
            <div className="coin-author">
              AUTHOR: {coin.creator?.toString().slice(0, 4)}...
              {coin.creator?.toString().slice(-4) || 'N/A'}
            </div>
            <div className="coin-age">AGE:::{relativeTime}</div>
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
            marginBottom: 2,
            fontSize: { xs: '1rem', sm: '1rem', md: '1.2rem', lg: '1.4rem' },
          },
        }}
      >
        <div className="coin-desc flex flex-col items-center justify-center">
          <div className="flex text-xs text-orange-300">DESCRIPTION: </div>"{' '}
          {coin.description || 'creator did not provide description'}"
        </div>
      </Box>
    </>
  )
}

export default CoinInfoDetails
