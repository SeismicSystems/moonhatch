// src/theme.ts
import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    primary: {
      main: '#161b33', // darkBlue
    },
    secondary: {
      main: '#474973', // midBlue
    },
    background: {
      default: '#0d0c1d', // bgColor
      paper: '#161b33', // darkBlue
    },
    text: {
      primary: '#f1dac4', // creamWhite
      secondary: '#a69cac', // lightBlue
    },
  },
  typography: {
    h1: {
      fontFamily: "'Tomorrow', sans-serif",

      fontSize: {
        xs: '1.6rem',
        sm: '2rem',
        md: '2.5rem',
        lg: '3rem',
      },
      fontWeight: 600,
    },
    h2: {
      fontFamily: "'Tomorrow', sans-serif",

      fontSize: {
        xs: '1.4rem',
        sm: '1.7rem',
        md: '2rem',
        lg: '2.4rem',
      },
      fontWeight: 500,
    },
    h3: {
      fontFamily: "'Tomorrow', sans-serif",
      fontSize: {
        xs: '1.2rem',
        sm: '1.5rem',
        md: '1.75rem',
        lg: '2rem',
      },
      fontWeight: 500,
    },
    h4: {
      fontFamily: "'Tomorrow', sans-serif",

      fontSize: {
        xs: '2.5rem',
        sm: '1.3rem',
        md: '1.5rem',
        lg: '2.75rem',
      },
      fontWeight: 500,
    },
    body1: {
      fontFamily: "'Tomorrow', sans-serif",

      fontSize: {
        xs: '0.875rem',
        sm: '0.9rem',
        md: '1rem',
        lg: '1.1rem',
      },
    },
    body2: {
      fontFamily: "'Tomorrow', sans-serif",

      fontSize: {
        xs: '0.75rem',
        sm: '0.8rem',
        md: '0.875rem',
        lg: '0.95rem',
      },
    },
  },
})

export default theme
