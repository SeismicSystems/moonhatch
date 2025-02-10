import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useShieldedWallet } from 'seismic-react'
import { hexToNumber } from 'viem'

import { useCreateCoin } from '@/hooks/useCreateCoin'
import { CoinFormData } from '@/types/coin'
import { stringifyBigInt } from '@/util'
import ImageUpload from '@components/create/image-upload'
import InputField from '@components/create/input-field'
import TickerInput from '@components/create/ticker-input'
import Alert from '@mui/material/Alert'
import Snackbar from '@mui/material/Snackbar'

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

  // State to control the success popup (Snackbar)
  const [successOpen, setSuccessOpen] = useState(false)

  const { createCoin } = useCreateCoin()
  const { publicClient } = useShieldedWallet()

  const uploadImage = async (coinId: number): Promise<string | null> => {
    if (!formData.image) {
      return null
    }
    const body = new FormData()
    body.append('file', formData.image)

    // Send a POST request to the backend
    return fetch(`http://127.0.0.1:3000/coin/${coinId}`, {
      method: 'POST',
      body,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Upload failed with status ${response.status}`)
        }
        // Assuming the backend returns the URL as plain text.
        return response.text()
      })
      .then((publicUrl) => {
        console.log('Uploaded image is available at:', publicUrl)
        return publicUrl
      })
      .catch((error) => {
        console.error('Error uploading image:', error)
        return null
      })
  }

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
    await uploadImage(coinId)

    // Show the success popup
    setSuccessOpen(true)
    // After 2 seconds, navigate to the coin detail page
    setTimeout(() => {
      navigate(`/coins/${coinId}`)
    }, 2000)

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

      {/* Snackbar to show a success popup */}
      <Snackbar
        open={successOpen}
        autoHideDuration={2000}
        onClose={() => setSuccessOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSuccessOpen(false)}
          severity="success"
          sx={{ width: '100%' }}
        >
          Coin created successfully!
        </Alert>
      </Snackbar>
    </div>
  )
}

export default CoinForm
