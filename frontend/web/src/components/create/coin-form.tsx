import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useShieldedWallet } from 'seismic-react'
import { hexToNumber } from 'viem'

import { useCreateCoin } from '../../state/get-coins'
import { CoinFormData } from '../../types/coin'
import { stringifyBigInt } from '../../util'
import ImageUpload from './image-upload'
import InputField from './input-field'
import TickerInput from './ticker-input'

const CoinForm: React.FC = () => {
  const [formData, setFormData] = useState<CoinFormData>({
    name: '',
    symbol: '',
    description: '',
    image: null,
    telegram: '',
    website: '',
    twitter: '',
  })

  const [showMore, setShowMore] = useState(false)
  const navigate = useNavigate()

  const { createCoin } = useCreateCoin()
  const { publicClient } = useShieldedWallet()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!publicClient) {
      return
    }
    const hash = await createCoin({
      name: formData.name,
      symbol: formData.symbol,
      supply: 21_000_000_000_000_000_000_000n,
    })
    if (!hash) {
      console.error('failed to broadcast tx')
      return
    }
    const receipt = await publicClient.waitForTransactionReceipt({ hash })
    console.log(JSON.stringify(receipt, stringifyBigInt, 2))
    const coinId = hexToNumber(receipt.logs[0].data)
    console.info(`Created coinId=${coinId}`)
    // TODO: post rest of form to server
    return
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="mb-4">
        <button
          className="text-blue-400 hover:text-blue-300"
          type="button"
          onClick={() => navigate(-1)}
        >
          [go back]
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField
          label="name"
          value={formData.name}
          onChange={(value) => setFormData({ ...formData, name: value })}
        />

        <TickerInput
          value={formData.symbol}
          onChange={(value) => setFormData({ ...formData, symbol: value })}
        />

        <div className="mb-4">
          <label className="block text-blue-400 mb-2 text-sm">
            description
          </label>
          <textarea
            className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white h-32"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
        </div>

        <ImageUpload
          onFileSelect={(file) => setFormData({ ...formData, image: file })}
        />

        <button
          type="button"
          className="text-blue-400 hover:text-blue-300"
          onClick={() => setShowMore(!showMore)}
        >
          {showMore ? 'hide' : 'show'} more options ↑
        </button>

        {showMore && (
          <div className="space-y-4">
            <InputField
              label="Telegram link"
              value={formData.telegram || ''}
              onChange={(value) =>
                setFormData({ ...formData, telegram: value })
              }
              optional
            />
            <InputField
              label="Website link"
              value={formData.website || ''}
              onChange={(value) => setFormData({ ...formData, website: value })}
              optional
            />
            <InputField
              label="Twitter or X link"
              value={formData.twitter || ''}
              onChange={(value) => setFormData({ ...formData, twitter: value })}
              optional
            />
          </div>
        )}

        <p className="text-gray-400 text-sm">
          tip: coin data cannot be changed after creation
        </p>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white rounded py-3 hover:bg-blue-700"
        >
          create coin
        </button>

        <p className="text-gray-400 text-sm text-center">
          when your coin completes its bonding curve you receive 0.1 testnet ETH
        </p>
      </form>
    </div>
  )
}

export default CoinForm
