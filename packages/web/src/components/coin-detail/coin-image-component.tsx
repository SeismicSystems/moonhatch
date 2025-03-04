import React from 'react'
import { Hex } from 'viem'

import { Address } from '@/components/address/address'
import { FALLBACK_COIN_IMAGE_URL } from '@/components/coin-detail/coin-info-details'
import { TokenBalance } from '@/components/coin/token-balance'
import { Coin } from '@/types/coin'
import { formatRelativeTime } from '@/util'
import { Box, Typography } from '@mui/material'

const CoinAddress: React.FC<{ address: Hex; name: string }> = ({
  address,
  name,
}) => {
  return (
    <div
      className="coin-address"
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'row',
        gap: 2,
      }}
    >
      <div className="text-orange-300">{name}:</div>
      <Address address={address} className="text-orange-200" />
    </div>
  )
}

const CoinImageComponent: React.FC<{ coin: Coin }> = ({ coin }) => {
  const relativeTime = formatRelativeTime(coin.createdAt)

  return (
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
          '& .coin-age': {
            fontSize: {
              xs: '0.75rem',
              sm: '1rem',
              md: '1rem',
              lg: '1rem',
            },
          },
          '& .coin-address': {
            fontSize: { xs: '14px', sm: '16px', md: '16px', lg: '16px' },
            width: '100%',
          },
        },
      }}
    >
      <div className="left-column">
        <div className=" img-container w-auto h-auto aspect-square ">
          <img src={coin.imageUrl ?? FALLBACK_COIN_IMAGE_URL} alt="Coin Logo" />
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
              ${coin.symbol.toUpperCase().slice(0, 8)}
            </div>
          </Typography>
          <CoinAddress address={coin.contractAddress} name="CA" />
          <CoinAddress address={coin.creator} name="CREATOR" />
          <div className="coin-age text-orange-100">AGE: {relativeTime}</div>
          <TokenBalance coin={coin} />
        </div>
      </div>
    </Box>
  )
}
export default CoinImageComponent
