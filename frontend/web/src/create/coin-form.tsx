import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import ImageUpload from './image-upload'
import InputField from './input-field'
import TickerInput from './ticker-input'

interface FormData {
  name: string
  ticker: string
  description: string
  image: File | null
  telegram?: string
  website?: string
  twitter?: string
}

const CoinForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    ticker: '',
    description: '',
    image: null,
    telegram: '',
    website: '',
    twitter: '',
  })

  const [showMore, setShowMore] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted:', JSON.stringify(formData))
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
          value={formData.ticker}
          onChange={(value) => setFormData({ ...formData, ticker: value })}
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
