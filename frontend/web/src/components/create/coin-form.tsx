import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useShieldedWallet } from 'seismic-react'
import { hexToNumber } from 'viem'

import { useCreateCoin } from '@/hooks/useCreateCoin'
import { useFetchCoin } from '@/hooks/useFetchCoin'
import { CoinFormData } from '@/types/coin'
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
  const { postCreatedCoin, verifyCoin, uploadImage } = useFetchCoin()
  const { publicClient } = useShieldedWallet()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!publicClient) return

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
    const coinId = hexToNumber(receipt.logs[0].data)

    console.info(`Created coinId=${coinId}`)
    const imageUrl: string | null = await uploadImage(coinId, formData.image)

    const backendResponse = await postCreatedCoin({
      coinId,
      formData,
      receipt,
      imageUrl,
    })

    if (!backendResponse.ok) {
      console.error(
        `Failed to save coin to backend: ${await backendResponse.text()}`
      )
      return
    }

    console.log('Coin successfully saved in the database')
    verifyCoin(coinId)
      .then(() => console.log(`Verified coin ${coinId}`))
      .catch((e) => console.error(`Failed verifying coin ${coinId}: ${e}`))

    setSuccessOpen(true)
    setTimeout(() => {
      navigate(`/coins/${coinId}`)
    }, 2000)
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="mb-4">
        <button
          className="text-orange-300 hover:text-blue-300"
          type="button"
          onClick={() => navigate(-1)}
        >
          [GO BACK]
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 ">
        <InputField
          label="NAME"
          value={formData.name}
          onChange={(value) => setFormData({ ...formData, name: value })}
        />

        <TickerInput
          value={formData.symbol}
          onChange={(value) => setFormData({ ...formData, symbol: value })}
        />

        <div className="mb-4">
          <label className="block text-[var(--lightBlue)] mb-2 text-sm">
            DESCRIPTION
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
          className="text-orange-300 hover:text-blue-300"
          onClick={() => setShowMore(!showMore)}
        >
          {showMore ? '↑ HIDE MORE OPTIONS ↑' : '↓ SHOW MORE OPTIONS ↓'}
        </button>

        {showMore && (
          <div className="space-y-4">
            <h3 className=" text-[var(--lightBlue)] text-[10px]">
              THESE FIELDS ARE OPTIONAL
            </h3>
            {/* Telegram Input */}
            <div className="flex items-center bg-gray-900 border border-gray-700 rounded p-2 text-white">
              <span className="text-gray-400 pr-2">t.me/</span>
              <input
                type="text"
                className="bg-transparent border-none outline-none w-full text-white"
                placeholder="handle"
                value={formData.telegram}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    telegram: e.target.value.replace('t.me/', ''),
                  })
                }
              />
            </div>

            {/* Twitter Input */}
            <div className="flex items-center bg-gray-900 border border-gray-700 rounded p-2 text-white">
              <span className="text-gray-400 pr-2">x.com/</span>
              <input
                type="text"
                className="bg-transparent border-none outline-none w-full text-white"
                placeholder="username"
                value={formData.twitter}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    twitter: e.target.value.replace('x.com/', ''),
                  })
                }
              />
            </div>

            {/* Website Input */}
            <div className="flex items-center bg-gray-900 border border-gray-700 rounded p-2 text-white">
              <span className="text-gray-400 pr-2">www.</span>
              <input
                type="text"
                className="bg-transparent border-none outline-none w-full text-white"
                placeholder="example.com"
                value={formData.website}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    website: e.target.value.replace('www.', ''),
                  })
                }
              />
            </div>
          </div>
        )}

        <p className="text-gray-400 text-sm">
          COIN DATA CANNOT BE CHANGED AFTER CREATION{' '}
        </p>

        <button
          type="submit"
          className="w-full bg-green-600 text-white rounded py-3 hover:bg-blue-700"
        >
          CREATE COIN
        </button>

        <p className="text-gray-400 text-sm text-center">
          WHEN YOUR COIN COMPLETES ITS BONDING CURVE, YOU RECEIVE 0.1 TESTNET
          ETH.
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
