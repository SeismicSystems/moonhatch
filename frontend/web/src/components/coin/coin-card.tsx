import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

// Import navigate hook
import { Coin } from '@/types/coin'
import { formatRelativeTime } from '@/util'
import SocialLink from '@components/coin/social-link'
import LockIcon from '@mui/icons-material/Lock'
import SchoolIcon from '@mui/icons-material/School'
import { Box, Typography } from '@mui/material'

interface CoinCardProps {
  coin: Coin
}

const CoinCard: React.FC<CoinCardProps> = ({ coin }) => {
  const navigate = useNavigate() // Navigation hook
  const defaultImage =
    'https://seismic-public-assets.s3.us-east-1.amazonaws.com/seismic-logo-light.png'

  const [imgSrc, setImgSrc] = useState(coin.imageUrl)

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
        width: '100%',
        borderRadius: '8px', // Tailwind rounded-lg
        boxShadow: '0px 4px 6px rgba(0,0,0,0.1)', // approximate shadow-md
        p: 2, // Tailwind p-4 (assuming 1 unit = 4px or 8px; adjust accordingly)
        display: 'flex',
        gap: 2,
        cursor: 'pointer',
        transition: 'box-shadow 0.3s ease-in-out',
        '&:hover': {
          boxShadow: '0px 8px 12px rgba(0,0,0,0.2)', // Tailwind hover:shadow-lg
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
            justifyContent: 'center',
            height: '150px ',
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
              src={imgSrc}
              alt="Coin Logo"
              style={{
                borderRadius: '8px',
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
              onError={() => {
                if (imgSrc !== defaultImage) {
                  setImgSrc(defaultImage)
                }
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
                  }}
                >
                  <Typography
                    variant="h4"
                    component="h4"
                    sx={{
                      fontSize: {
                        xs: '1.2rem',
                        sm: '1.3rem',
                        md: '1.5rem',
                        lg: '1.6rem',
                      },
                      mb: '0',
                      color: 'var(--creamWhite)',
                    }}
                  >
                    {scrambledName}
                  </Typography>
                  <Box
                    component="div"
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      ml: 1,
                    }}
                  >
                    {coin.graduated ? (
                      <SchoolIcon
                        sx={{
                          fontSize: { xs: '20px', sm: '20px', md: '24px' },
                          color: 'green',
                          mx: 1,
                        }}
                      />
                    ) : (
                      <LockIcon
                        sx={{
                          fontSize: { xs: '20px', sm: '20px', md: '24px' },
                          color: 'red',
                          mx: 1,
                        }}
                      />
                    )}
                  </Box>
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: { xs: '0.875rem', md: '1rem' },
                    color: 'var(--midBlue)',
                  }}
                >
                  {scrambledSymbol}
                </Typography>
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
                <Box
                  component="div"
                  sx={{
                    width: '83.33%', // Tailwind w-5/6
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: { xs: '9px', md: '10px' }, // Tailwind text-[9px] md:text-[10px]
                      mb: '-0.125rem', // Tailwind -mb-2 approximated
                      color: 'var(--creamWhite)',
                    }}
                  >
                    DESCRIPTION:
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      mt: 1, // Tailwind mt-2 (adjust spacing if needed)
                      fontSize: { xs: '0.75rem', md: '14px' }, // Tailwind text-xs md:text-[14px]
                      color: 'var(--lightBlue)',
                    }}
                  >
                    {coin.description.length > 50
                      ? `${coin.description.substring(0, 50)}...`
                      : coin.description}
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
            {coin.website && (
              <SocialLink
                href={coin.website}
                type="website"
                label="website"
                onClick={(e) => e.stopPropagation()}
              />
            )}
            {coin.telegram && (
              <SocialLink
                href={coin.telegram}
                type="telegram"
                label="telegram"
                onClick={(e) => e.stopPropagation()}
              />
            )}
            {coin.twitter && (
              <SocialLink
                href={coin.twitter}
                type="twitter"
                label="twitter"
                onClick={(e) => e.stopPropagation()}
              />
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default CoinCard
