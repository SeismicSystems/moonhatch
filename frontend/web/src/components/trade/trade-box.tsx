import { Box } from '@mui/material'
import React from 'react'

export const TradeOuterBox: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <Box
      sx={{
        width: { xs: '300px', sm: '450px' },
        mx: 'auto',
        paddingBottom: { xs: 2, sm: 2, md: 0, lg: 2, xl: 2 },
        marginBottom: { xs: 2, sm: 2, md: 0, lg: 2, xl: 2 },
      }}
    >
      {children}
    </Box>
  )
}

type TradeInnerBoxProps = {
  style?: React.CSSProperties
}

export const TradeInnerBox: React.FC<React.PropsWithChildren<TradeInnerBoxProps>> = ({ style = {}, children }) => {
  return (
    <Box
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        ...style,
      }}
    >
      {children}
    </Box>
  )
}