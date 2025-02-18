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
          marginTop: { xs: 2, sm: 2, md: 6, lg: 6, xl: 8 },
          marginBottom: 4,
          alignItems: 'center',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: { xs: 2, sm: 8, lg: 6 },
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
