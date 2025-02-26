import React from 'react'
import { Button, SxProps } from '@mui/material'

type TradeButtonProps = {
  onClick: () => void
  disabled?: boolean
  sx?: SxProps
}

export const NonGraduatedTradeButton: React.FC<React.PropsWithChildren<TradeButtonProps>> = ({ children, onClick, disabled }) => {
  return (
    <button
      className="h-[10dvh] "
      style={{
        width: '85%',
        padding: '10px',
        backgroundColor: 'green',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        color: 'var(--creamWhite)',
      }}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

export const GraduatedTradeButton: React.FC<React.PropsWithChildren<TradeButtonProps>> = ({ children, onClick, disabled, sx = {} }) => {
  return (
    <Button
      fullWidth
      sx={{
        fontFamily: 'inherit',
        height: { xs: '60px', sm: '70px', md: '80px', lg: '90px' },
        borderRadius: '4px',
        fontSize: {
          xs: '1rem',
          sm: '1.1rem',
          md: '1.2rem',
          lg: '1.3rem',
        },
        textTransform: 'none',
        ...sx,
      }}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </Button>
  )
}
