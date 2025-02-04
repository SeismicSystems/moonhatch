import React from 'react'

import { Coin } from '../storage/client'
import CoinImage from './coin-image'
import SocialLink from './social-link'

interface CoinCardProps {
  coin: Coin
}

// Individual Coin Card Component
const CoinCard: React.FC<CoinCardProps> = ({ coin }) => {
  const formattedDate = new Date(coin.createdAt * 1000).toLocaleDateString()

  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-start gap-4">
        {coin.imageUrl && <CoinImage src={coin.imageUrl} name={coin.name} />}

        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold">{coin.name}</h3>
              <span className="text-sm text-gray-500">{coin.ticker}</span>
            </div>
            <span className="text-xs text-gray-400">{formattedDate}</span>
          </div>

          <p className="mt-2 text-gray-600 text-sm">{coin.description}</p>

          <div className="mt-3 flex flex-wrap gap-2">
            {coin.website && (
              <SocialLink href={coin.website} type="website" label="Website" />
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
  )
}

export default CoinCard
