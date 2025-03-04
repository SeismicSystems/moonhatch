import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import CoinSocials from '@/components/coin/coin-social'
import { Coin } from '@/types/coin'
import { formatRelativeTime } from '@/util'
import LockIcon from '@mui/icons-material/Lock'
import SchoolIcon from '@mui/icons-material/School'
import { Box, Typography } from '@mui/material'

import { TokenBalance } from './balance'

interface CoinCardProps {
  coin: Coin
}

export const FALLBACK_IMAGE_URL =
  'https://seismic-public-assets.s3.us-east-1.amazonaws.com/seismic-logo-light.png'

const CoinCard: React.FC<CoinCardProps> = ({ coin }) => {
  const navigate = useNavigate()

  // State for scrambled text elements (only name & ticker)
  const [scrambledName, setScrambledName] = useState(coin.name.toUpperCase())
  const [scrambledSymbol, setScrambledSymbol] = useState(
    `$${coin.symbol.toUpperCase()}`
  )

  useEffect(() => {
    const scrambleText = (
      text: string,
      setText: (val: string) => void,
      duration: number
    ) => {
      const chars = '!<>-_\\/[]{}—=+*^?#________'
      let iterations = 0
      let displayText = text
        .split('')
        .map(() => chars[Math.floor(Math.random() * chars.length)])
        .join('')
      setText(displayText)

      const interval = setInterval(() => {
        displayText = displayText
          .split('')
          // @ts-expect-error this is fine
          .map((char, index) =>
            index < iterations
              ? text[index]
              : chars[Math.floor(Math.random() * chars.length)]
          )
          .join('')

        setText(displayText)

        if (iterations >= text.length) {
          clearInterval(interval)
          setText(text)
        }

        iterations += 1
      }, duration / text.length)
    }

    // Scramble only the name and ticker for 500ms
    scrambleText(coin.name.toUpperCase(), setScrambledName, 1000)
    scrambleText(`$${coin.symbol.toUpperCase()}`, setScrambledSymbol, 1000)
  }, [coin])

  return (
    <Box
      component="div"
      sx={{
        backgroundColor: 'var(--darkBlue)',
        border: '2px solid var(--creamWhite)',
        width: '100%',
        borderRadius: '8px',
        boxShadow: '0px 4px 6px rgba(255,165,0,0.)',
        p: 2,
        display: 'flex',
        gap: 2,
        cursor: 'pointer',
        transition: 'box-shadow 0.3s ease-in-out',
        '&:hover': {
          boxShadow: '0px 8px 12px rgba(0,0,0,0.2)',
        },
      }}
      onClick={() => navigate(`/coins/${coin.id}`)}
    >
      {/* Left Panel: Coin details */}
      <Box component="div" sx={{ flex: 1 }}>
        <Box
          component="div"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            width: '100%',
            justifyContent: 'center',
            height: { xs: '150px', sm: '150px', md: '180px' },
          }}
        >
          {/* Image container */}
          <Box
            component="div"
            sx={{
              width: '96px',
              height: '96px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img
              src={coin.imageUrl || FALLBACK_IMAGE_URL}
              alt="Coin Logo"
              style={{
                borderRadius: '8px',
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </Box>

          {/* Text and details container */}
          <Box component="div" sx={{ flex: 1 }}>
            <Box
              component="div"
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
              }}
            >
              <Box component="div" sx={{ textAlign: 'left', width: '100%' }}>
                <Box
                  component="div"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    width: {
                      xs: '150px',
                      sm: '150px',
                      md: '200px',
                      lg: '200px',
                    },
                  }}
                >
                  <Typography
                    noWrap
                    variant="h4"
                    component="h4"
                    sx={{
                      fontSize: {
                        xs: '1.2rem',
                        sm: '1.2rem',
                        md: '1.5rem',
                        lg: '1.6rem',
                      },

                      color: 'var(--creamWhite)',
                    }}
                  >
                    {scrambledName}
                  </Typography>
                </Box>
                <Box
                  display="flex"
                  flexDirection="row"
                  gap={1}
                  alignItems="center"
                  sx={{
                    width: { xs: '150px', sm: '150px' },
                  }}
                >
                  {coin.graduated ? (
                    <SchoolIcon
                      sx={{
                        fontSize: { xs: '20px', sm: '20px', md: '24px' },
                        color: 'green',
                      }}
                    />
                  ) : (
                    <LockIcon
                      sx={{
                        fontSize: { xs: '20px', sm: '20px', md: '24px' },
                        color: 'red',
                      }}
                    />
                  )}
                  <Typography
                    noWrap
                    variant="body2"
                    sx={{
                      fontSize: { xs: '0.875rem', md: '1rem' },
                      color: 'lightgreen',
                    }}
                  >
                    {scrambledSymbol}
                  </Typography>
                </Box>
                <Typography
                  component="div"
                  sx={{
                    alignSelf: 'end',
                    fontSize: { xs: '10px', md: '12px' }, // Tailwind text-[10px] md:text-[12px]
                    color: 'var(--lightBlue)',
                  }}
                >
                  AGE: {formatRelativeTime(coin.createdAt)}
                </Typography>
                <Box>
                  <TokenBalance coin={coin} />
                </Box>
                <Box
                  component="div"
                  sx={{
                    width: {
                      xs: '150px',
                      sm: '150px',
                      md: '200px',
                      lg: '200px',
                    },
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: { xs: '9px', md: '10px' }, // Tailwind text-[9px] md:text-[10px]
                      color: 'orange',
                    }}
                  >
                    DESCRIPTION:
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      // Tailwind mt-2 (adjust spacing if needed)
                      fontSize: { xs: '0.75rem', md: '14px' }, // Tailwind text-xs md:text-[14px]
                      color: 'var(--lightBlue)',
                      whiteSpace: 'pre-wrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {coin.description && coin.description.length > 50
                      ? `${coin.description.substring(0, 50)}...`
                      : coin.description || ''}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Social Links */}
          <Box
            component="div"
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: 2,
              textAlign: 'center',
            }}
            onClick={(e) => e.stopPropagation()} // Prevent card click from triggering
          >
            <CoinSocials
              coin={{
                ...coin,
                id: coin.id,
                twitter: coin.twitter || '',
                telegram: coin.telegram || '',
                website: coin.website || '',
              }}
              isCardPage={true}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default CoinCard
