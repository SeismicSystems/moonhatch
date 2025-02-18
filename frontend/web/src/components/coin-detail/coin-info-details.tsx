import React from 'react'

import { formatRelativeTime } from '@/util'
import SocialLink from '@components/coin/social-link'
import { Box } from '@mui/system'

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
            width: '300px',
            padding: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            borderRadius: '16px',
            backgroundColor: 'var(--darkBlue)',
          },
          '& img': {
            width: '6rem',
            height: '6rem',
            borderRadius: '8px',
            objectFit: 'cover',
          },
          '& .right-column': {
            display: 'flex',
            flexDirection: 'column',
            textAlign: 'left',
            '& .coin-name': {
              fontSize: '18px',
              color: 'var(--creamWhite)',
            },
            '& .coin-symbol': {
              fontSize: '16px',
              color: 'var(--creamWhite)',
            },
            '& .coin-author, & .coin-age': {
              color: 'var(--lightBlue)',
              fontSize: '0.75rem',
            },
          },
        }}
      >
        <div className="left-column">
          <div>
            <img
              src={coin.imageUrl ?? FALLBACK_COIN_IMAGE_URL}
              alt="Coin Logo"
            />
          </div>
          <div className="right-column">
            <div className="coin-name">{coin.name.toUpperCase()}</div>
            <div className="coin-symbol">$:{coin.symbol.toUpperCase()}</div>
            <div className="coin-author">
              AUTHOR: {coin.creator?.toString().slice(0, 4)}...
              {coin.creator?.toString().slice(-4) || 'N/A'}
            </div>
            <div className="coin-age">AGE:{relativeTime}</div>
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
          },
        }}
      >
        <div className="coin-desc">
          "{coin.description || 'creator did not provide description'}"
        </div>
      </Box>

      <Box
        sx={{
          display: 'flex',
          marginTop: 2,
          marginBottom: 4,
          alignItems: 'center',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: 2,
          textAlign: 'center',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {coin.website && (
          <SocialLink href={coin.website} type="website" label="website" />
        )}
        {coin.telegram && (
          <SocialLink href={coin.telegram} type="telegram" label="telegram" />
        )}
        {coin.twitter && (
          <SocialLink href={coin.twitter} type="twitter" label="twitter" />
        )}
      </Box>
    </>
  )
}

export default CoinInfoDetails
