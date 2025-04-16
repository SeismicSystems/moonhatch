import React from 'react'

import { Box, SxProps, Theme } from '@mui/material'

export const TradeOuterBox: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  return (
    <Box
      sx={{
        width: { xs: '300px', sm: '450px' },
        mx: 'auto',
        marginBottom: { xs: 2, sm: 2, md: 0, lg: 2, xl: 2 },
      }}
    >
      {children}
    </Box>
  )
}

type TradeInnerBoxProps = {
  sx?: SxProps<Theme>
}

export const TradeInnerBox: React.FC<
  React.PropsWithChildren<TradeInnerBoxProps>
> = ({ sx = {}, children }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        ...sx,
      }}
    >
      {children}
    </Box>
  )
}
