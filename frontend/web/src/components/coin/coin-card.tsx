import React, { useEffect, useState } from 'react'
import { useShieldedWallet } from 'seismic-react'

import { Coin } from '@/types/coin'
import { formatRelativeTime } from '@/util'
import SocialLink from '@components/coin/social-link'

interface CoinCardProps {
  coin: Coin
}

const CoinCard: React.FC<CoinCardProps> = ({ coin }) => {
  //implement Z to correct timezone issue
  const relativeTime = formatRelativeTime(coin.createdAt)
  const { walletClient } = useShieldedWallet()

  const defaultImage =
    'https://seismic-public-assets.s3.us-east-1.amazonaws.com/seismic-logo-light.png'

  const [imgSrc, setImgSrc] = useState(coin.imageUrl)

  useEffect(() => {}, [coin, walletClient])

  return (
    <div className="bg-[var(--darkBlue)] rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow flex gap-4">
      {/* Left panel: Coin details */}
      <div className="flex-1">
        <div className="flex items-center gap-4 justify-center">
          {/* Wrap the image in a flex container for perfect centering */}
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
                <div className="flex">
                  <h3 className="text-lg -mb-2 text-[var(--creamWhite)]">
                    {coin.name.toUpperCase()}
                  </h3>
                  <div className=" self-end ml-1 text-[8px] text-[var(--lightBlue)]">
                    {relativeTime}
                  </div>
                </div>
                <span className="text-sm text-[var(--midBlue)]">
                  ${coin.symbol.toUpperCase()}
                </span>
                <div className="desc-container w-5/6">
                  <p className=" text-sm -mb-2  text-[var(--lightBlue)]">
                    desc:
                  </p>
                  <p className="mt-2 text-[var(--lightBlue)] text-xs">
                    {coin.description.length > 50
                      ? `${coin.description.substring(0, 50)}...`
                      : coin.description}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {coin.website && (
                <SocialLink
                  href={coin.website}
                  type="website"
                  label="Website"
                />
              )}
              {coin.telegram && (
                <SocialLink
                  href={coin.telegram}
                  type="telegram"
                  label="Telegram"
                />
              )}
              {coin.twitter && (
                <SocialLink href={coin.twitter} type="twitter" label="𝕏" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default CoinCard
