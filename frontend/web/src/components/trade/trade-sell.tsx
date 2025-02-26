import React, { useEffect, useState } from 'react'
import { formatEther } from 'viem'

import { GraduatedAmountInput } from '@/components/trade/amount-input'
import { GraduatedTradeButton } from '@/components/trade/trade-button'
import { TransactionGraduatedProps } from '@/components/trade/transaction-graduated'
import { usePumpClient } from '@/hooks/usePumpClient'
import { parseBigInt } from '@/util'

export const Sell: React.FC<TransactionGraduatedProps> = ({ coin }) => {
  const [error, setError] = useState('')

  const [isPreviewing, setIsPreviewing] = useState(false)
  const [isSelling, setIsSelling] = useState(false)

  const [previewWeiOut, setPreviewWeiOut] = useState<bigint | null>(null)

  const [amountInput, setAmountInput] = useState('')
  const [amountIn, setAmountIn] = useState<bigint | null>(null)

  const { previewSell, approveAndSell, explorerUrl } = usePumpClient()

  const previewAmountOut = async () => {
    if (!amountIn) {
      return
    }
    const previewOut = await previewSell({ token: coin.contractAddress, amountIn })
    setPreviewWeiOut(previewOut)
  }

  const sellCoin = () => {
    if (!amountIn) {
      setError('Invalid amount')
      return
    }
    if (isSelling) {
      setError('Already selling')
      return
    }
    setIsSelling(true)

    approveAndSell({ token: coin.contractAddress, amountIn })
      .then((sellTxHash) => {
        console.log(`Sent sell tx: ${sellTxHash}`)
        // TODO: toast with link to explorer url IF it exists
        const url = explorerUrl(sellTxHash)
        if (url) {
          console.log(`Explorer url: ${url}`)
        }
      })
      .catch((e) => { setError(e) })
      .finally(() => {
        setIsSelling(false)
      })
  }

  useEffect(() => {
    setAmountIn(parseBigInt(amountInput))
  }, [amountInput])

  useEffect(() => {
    if (isPreviewing) {
      return
    }
    setIsPreviewing(true)

    previewAmountOut()
      .then()
      .catch(e => { setError(`Failed to simulate sale: ${e}`) })
      .finally(() => { setIsPreviewing(false) })
  }, [amountIn])

  return (
    <>
      <GraduatedAmountInput
        amount={amountInput}
        setAmount={setAmountInput}
        placeholder={`ENTER ${coin.name.toUpperCase()} AMOUNT`}
      />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <GraduatedTradeButton
        onClick={sellCoin}
        disabled={amountIn !== null}
        sx={{
          padding: { xs: '8px', sm: '10px', md: '12px', lg: '14px' },
          color: 'white',
          backgroundColor: 'red',
          '&:hover': { backgroundColor: 'darkred' },
        }}
      >
        {previewWeiOut
          ? `CONFIRM SELL. ESTIMATED ETH: ${formatEther(previewWeiOut)} ETH`
          : 'Loading estimated ...'}
      </GraduatedTradeButton>
    </>
  )
}
