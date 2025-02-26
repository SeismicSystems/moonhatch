import React from 'react'
import { Box } from '@mui/material'

import SocialLink from '@/components/coin/social-link'

interface CoinSocialsProps {
  coin: {
    id: bigint
    twitter: string
    website: string
    telegram: string
  }
  // Pass a flag or directly pass sizes if needed
  isCardPage?: boolean
}

const CoinSocials: React.FC<CoinSocialsProps> = ({ coin, isCardPage }) => {
  // Responsive sizes for different isCardPage:
  const cardPageIconSize = { xs: 22, sm: 25, md: 30, lg: 30 }
  const detailIconSize = { xs: 30, sm: 40, md: 50, lg: 50 }

  const iconSize = isCardPage ? cardPageIconSize : detailIconSize
  const marginTop = isCardPage
    ? { xs: 2, sm: 2, md: 2, lg: 2 }
    : { xs: 8, sm: 8, md: -10, lg: -10, xl: -10 }
  const marginBottom = isCardPage ? 2 : 4
  const flexDirection = isCardPage ? 'column' : 'row'
  const iconGap = isCardPage ? { xs: 2, sm: 2, lg: 2 } : 8
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: flexDirection,
        marginTop: marginTop,
        marginBottom: marginBottom,
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: iconGap,
        textAlign: 'center',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {coin.website && (
        <SocialLink
          href={coin.website}
          type="website"
          label="website"
          iconSize={iconSize}
        />
      )}
      {coin.telegram && (
        <SocialLink
          href={coin.telegram}
          type="telegram"
          label="telegram"
          iconSize={iconSize}
        />
      )}
      {coin.twitter && (
        <SocialLink
          href={coin.twitter}
          type="twitter"
          label="twitter"
          iconSize={iconSize}
        />
      )}
    </Box>
  )
}

export default CoinSocials
