import { TextField } from '@mui/material'
import React from 'react'

type AmountInputProps = {
  amount: string
  setAmount: (value: string) => void,
  placeholder: string
}

export const NonGraduatedAmountInput: React.FC<React.PropsWithChildren<AmountInputProps>> = ({ amount, setAmount, placeholder }) => {
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
        borderRadius: '4px',
        textAlign: 'center',
        border: '1px solid var(--midBlue)',
        backgroundColor: 'var(--lightBlue)',
      }}
    />
  )
}

export const GraduatedAmountInput: React.FC<React.PropsWithChildren<AmountInputProps>> = ({ amount, setAmount, placeholder }) => {
  return (
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
      }}
    />
  )
}
