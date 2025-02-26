import React, { useEffect, useState } from 'react'

import { GraduatedAmountInput } from '@/components/trade/amount-input'
import { GraduatedTradeButton } from '@/components/trade/trade-button'
import { TransactionGraduatedProps } from '@/components/trade/transaction-graduated'
import { displayTokenAmount, parseBigInt } from '@/util'
import { usePumpClient } from '@/hooks/usePumpClient'

export const Buy: React.FC<TransactionGraduatedProps> = ({ coin }) => {
  const [error, setError] = useState('')

  const [isPreviewing, setIsPreviewing] = useState(false)
  const [isBuying, setIsBuying] = useState(false)

  const [previewUnitsOut, setPreviewUnitsOut] = useState<bigint | null>(null)

  const [weiInput, setWeiInput] = useState('')
  const [weiIn, setWeiIn] = useState<bigint | null>(null)

  const { previewBuy, buyPostGraduation, explorerUrl } = usePumpClient()

  const previewAmountOut = async () => {
    if (!weiIn) {
      return
    }
    const previewOut = await previewBuy({ token: coin.contractAddress, amountIn: weiIn })
    setPreviewUnitsOut(previewOut)
  }

  const buyCoin = () => {
    if (!weiIn) {
      setError('Invalid amount')
      return
    }
    if (isBuying) {
      setError('Already selling')
      return
    }
    setIsBuying(true)

    buyPostGraduation({ token: coin.contractAddress, amountIn: weiIn })
      .then((buyTxHash) => {
        console.log(`Sent buy tx: ${buyTxHash}`)
        // TODO: toast with link to explorer url
        const url = explorerUrl(buyTxHash)
        if (url) {
          console.log(`Explorer url: ${url}`)
        }
      })
      .catch((e) => { setError(e) })
      .finally(() => {
        setIsBuying(false)
      })
  }

  useEffect(() => {
    setWeiIn(parseBigInt(weiInput))
  }, [weiInput])

  useEffect(() => {
    if (isPreviewing) {
      return
    }
    setIsPreviewing(true)

    previewAmountOut()
      .then()
      .catch(e => { setError(`Failed to simulate sale: ${e}`) })
      .finally(() => { setIsPreviewing(false) })
  }, [weiIn])

  return (
    <>
      <GraduatedAmountInput
        amount={weiInput}
        setAmount={setWeiInput}
        placeholder='SET ETH AMOUNT'
      />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <GraduatedTradeButton
        onClick={buyCoin}
        disabled={weiIn !== null}
        sx={{
          padding: { xs: '50px', sm: '50px', md: '50px', lg: '50px' },
          color: 'var(--creamWhite)',
          backgroundColor: 'green',
          '&:hover': { backgroundColor: 'darkgreen' },
        }}
      >
        {previewUnitsOut
          ? `CONFIRM BUY FOR ${displayTokenAmount(previewUnitsOut, coin.decimals)} ${coin.name.toUpperCase()}`
          : 'Loading estimated price ...'}
      </GraduatedTradeButton>
    </>
  )
}
