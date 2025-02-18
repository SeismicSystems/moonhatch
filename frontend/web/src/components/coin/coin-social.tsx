import React from 'react'

import { Box } from '@mui/material'

import SocialLink from './social-link'

interface CoinSocialsProps {
  coin: {
    id: bigint
    twitter: string
    website: string
    telegram: string
  }
}
const CoinSocials: React.FC<CoinSocialsProps> = ({ coin }) => {
  console.log('CoinSocials', coin)
  return (
    <>
      {' '}
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

export default CoinSocials
