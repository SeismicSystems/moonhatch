import React, { useState } from 'react'
import { set, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useShieldedWallet } from 'seismic-react'
import { hexToNumber } from 'viem'

import { useFetchCoin } from '@/hooks/useFetchCoin'
import { usePumpClient } from '@/hooks/usePumpClient'
import { useToastNotifications } from '@/hooks/useToastNotifications'
import { CoinFormData } from '@/types/coin'
import ImageUpload from '@components/create/image-upload'

const CoinForm: React.FC = () => {
  const navigate = useNavigate()
  const { createCoin } = usePumpClient()
  const { postCreatedCoin, verifyCoin, uploadImage } = useFetchCoin()
  const { publicClient } = useShieldedWallet()
  const { notifySuccess, notifyError } = useToastNotifications()
  const [showMore, setShowMore] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CoinFormData>({
    defaultValues: {
      name: '',
      symbol: '',
      description: '',
      image: null,
      twitter: '',
      telegram: '',
      website: '',
    },
  })

  const image = watch('image')

  const onSubmit = async (formData: CoinFormData) => {
    setIsCreating(true)
    if (!publicClient) return

    const hash = await createCoin({
      name: formData.name,
      symbol: formData.symbol,
      supply: 21_000_000_000_000_000_000_000n,
    })

    if (!hash) {
      notifyError('Failed to broadcast transaction')
      console.error('Failed to broadcast transaction')
      return
    }

    const receipt = await publicClient.waitForTransactionReceipt({ hash })
    const coinId = hexToNumber(receipt.logs[0].data)

    console.info(`Created coinId=${coinId}`)

    const imageUrl = formData.image
      ? await uploadImage(coinId, formData.image)
      : null

    const backendResponse = await postCreatedCoin({
      coinId,
      formData,
      receipt,
      imageUrl,
    })

    if (!backendResponse.ok) {
      notifyError('Failed to broadcast transaction')
      console.error('Failed to save coin to backend')
      return
    }

    console.log('✅ Coin successfully saved in the database')

    verifyCoin(coinId)
      .then(() => console.log(`Verified coin ${coinId}`))
      .catch((e) => console.error(`Failed verifying coin ${coinId}: ${e}`))

    notifySuccess('Coin created successfully')
    setTimeout(() => {
      navigate(`/coins/${coinId}`)
    }, 1000)

    console.log('Final Form Data:', formData)
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="mb-4">
          <label className="block mb-2 text-sm text-[var(--lightBlue)]">
            NAME
          </label>
          <input
            {...register('name', { required: 'Name is required' })}
            className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-[var(--creamWhite)]"
            placeholder="Enter name"
          />
          {errors.name && (
            <p className="text-red-500 text-sm">{errors.name.message}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block mb-2 text-sm text-[var(--lightBlue)]">
            SYMBOL
          </label>
          <input
            {...register('symbol', { required: 'Symbol is required' })}
            className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-[var(--creamWhite)]"
            placeholder="Enter symbol"
          />
          {errors.symbol && (
            <p className="text-red-500 text-sm">{errors.symbol.message}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-[var(--lightBlue)] mb-2 text-sm">
            DESCRIPTION
          </label>
          <textarea
            {...register('description')}
            className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white h-32"
            placeholder="Enter description"
          />
        </div>

        <ImageUpload onFileSelect={(file) => setValue('image', file)} />
        {image && (
          <p className="text-green-400">Image selected: {image.name}</p>
        )}

        <button
          type="button"
          className="text-orange-300 hover:text-blue-300"
          onClick={() => setShowMore(!showMore)}
        >
          {showMore ? '↑ HIDE MORE OPTIONS ↑' : '↓ SHOW MORE OPTIONS ↓'}
        </button>

        {showMore && (
          <div className="space-y-4">
            <h3 className="text-[var(--lightBlue)] text-[10px]">
              THESE FIELDS ARE OPTIONAL
            </h3>

            <div className="flex items-center bg-gray-900 border border-gray-700 rounded p-2 text-white">
              <span className="text-gray-400 pr-2">x.com/</span>
              <input
                {...register('twitter')}
                className="bg-transparent border-none outline-none w-full text-white"
                placeholder="username"
              />
            </div>

            <div className="flex items-center bg-gray-900 border border-gray-700 rounded p-2 text-white">
              <span className="text-gray-400 pr-2">www.</span>
              <input
                {...register('website')}
                className="bg-transparent border-none outline-none w-full text-white"
                placeholder="example.com"
              />
            </div>

            <div className="flex items-center bg-gray-900 border border-gray-700 rounded p-2 text-white">
              <span className="text-gray-400 pr-2">t.me/</span>
              <input
                {...register('telegram')}
                className="bg-transparent border-none outline-none w-full text-white"
                placeholder="handle"
              />
            </div>
          </div>
        )}

        <p className="text-gray-400 text-sm">
          COIN DATA CANNOT BE CHANGED AFTER CREATION
        </p>

        <button
          type="submit"
          className="w-full bg-green-600 text-white rounded py-3 hover:bg-blue-700"
          disabled={isCreating}
        >
          {isCreating ? 'WAITING FOR WALLET APPROVAL' : 'CREATE COIN'}
        </button>
      </form>
    </div>
  )
}

export default CoinForm
