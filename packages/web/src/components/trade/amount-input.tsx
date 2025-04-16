import React from 'react'
import { formatUnits } from 'viem'

import { formatUnitsRounded } from '@/util'
import { Button, TextField, Typography } from '@mui/material'

type AmountInputProps = {
  amount: string
  setAmount: (value: string) => void
  placeholder: string
  maxAmount?: bigint | null
  decimals: number
}

export const NonGraduatedAmountInput: React.FC<
  React.PropsWithChildren<AmountInputProps>
> = ({ amount, setAmount, placeholder }) => {
  return (
    <input
      type="text"
      value={amount}
      className="h-[40px] lg:h-[80px]"
      onChange={(e) => setAmount(e.target.value)}
      placeholder={placeholder}
      style={{
        width: '85%',
        padding: '8px',
        borderRadius: '4rem',
        textAlign: 'center',
        border: '1px solid var(--midBlue)',
        backgroundColor: 'var(--lightBlue)',
      }}
    />
  )
}

export const GraduatedAmountInput: React.FC<
  React.PropsWithChildren<AmountInputProps>
> = ({ amount, setAmount, placeholder, maxAmount, decimals }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',

        gap: '8px',
      }}
    >
      <TextField
        variant="outlined"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder={placeholder}
        fullWidth
        sx={{
          '& .MuiOutlinedInput-input': {
            textAlign: 'center',
            color: 'var(--darkBlue)',

            fontSize: {
              xs: '1rem',
              sm: '1.1rem',
              md: '1.2rem',
              lg: '1.3rem',
            },
          },
          backgroundColor: 'var(--lightBlue)',
          borderRadius: '4px',
          mb: 1,
          flex: 1,
        }}
      />
      {maxAmount ? (
        <Button
          onClick={() => setAmount(formatUnits(maxAmount, decimals))}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'gray',
            borderRadius: '4px',
            padding: '8px',
            mb: 1,
            border: '1px solid var(--midBlue)',
            cursor: 'pointer',
          }}
        >
          <Typography variant="body2" color="white">
            MAX
          </Typography>
          <Typography variant="body2" color="white">
            {formatUnitsRounded(maxAmount, decimals, 2)}
          </Typography>
        </Button>
      ) : null}
    </div>
  )
}
