import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

// Import navigate hook
import { Coin } from '@/types/coin'
import { formatRelativeTime } from '@/util'
import SocialLink from '@components/coin/social-link'
import LockIcon from '@mui/icons-material/Lock'
import SchoolIcon from '@mui/icons-material/School'

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
    scrambleText(coin.name.toUpperCase(), setScrambledName, 500)
    scrambleText(`$${coin.symbol.toUpperCase()}`, setScrambledSymbol, 500)
  }, [coin])

  return (
    <div
      className="coin-card-container bg-[var(--darkBlue)] w-full rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow flex gap-4 cursor-pointer"
      onClick={() => navigate(`/coins/${coin.id}`)} // Navigate when clicking card
    >
      {/* Left panel: Coin details */}
      <div className="flex-1">
        <div className="flex items-center gap-4 justify-center">
          <div className="w-24 h-24 flex items-center justify-center">
            <img
              src={imgSrc}
              alt="Coin Logo"
              className="rounded-lg w-full h-full object-cover"
              onError={() => {
                if (imgSrc !== defaultImage) {
                  setImgSrc(defaultImage)
                }
              }}
            />
          </div>
          <div className="flex-1">
            <div className="flex items-start">
              <div className="text-left">
                <div className="flex items-center">
                  <h3 className="text-lg md:text-xl -mb-2 text-[var(--creamWhite)]">
                    {scrambledName}
                  </h3>
                  <div className="items-center justify-center">
                    {coin.graduated ? (
                      <SchoolIcon
                        className="lock-icon text-green-500 mx-1"
                        sx={{
                          fontSize: { xs: '20px', sm: '20px', md: '24px' },
                        }}
                      />
                    ) : (
                      <LockIcon
                        className="lock-icon text-red-500 mx-1"
                        sx={{
                          fontSize: { xs: '20px', sm: '20px', md: '24px' },
                        }}
                      />
                    )}
                  </div>
                </div>
                <span className="text-sm md:text-[16px] text-[var(--midBlue)]">
                  {scrambledSymbol}
                </span>
                <div className="self-end text-[10px] md:text-[12px] text-[var(--lightBlue)]">
                  AGE: {formatRelativeTime(coin.createdAt)}
                </div>
                <div className="desc-container w-5/6">
                  <p className="text-[9px] md:text-[10px] -mb-2 text-[var(--creamWhite)]">
                    DESCRIPTION:
                  </p>
                  <p className="mt-2 text-[var(--lightBlue)] text-xs md:text-[14px]">
                    {coin.description.length > 50
                      ? `${coin.description.substring(0, 50)}...`
                      : coin.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
          {/* Social Links */}
          <div
            className="flex flex-col items-center justify-center flex-wrap gap-2 text-center"
            onClick={(e) => e.stopPropagation()} // Prevents card click from triggering
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
          </div>
        </div>
      </div>
    </div>
  )
}

export default CoinCard
