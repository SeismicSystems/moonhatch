import React, { useEffect, useState } from 'react'
import { formatUnits, parseEther } from 'viem'

import { GraduatedAmountInput } from '@/components/trade/amount-input'
import { GraduatedTradeButton } from '@/components/trade/trade-button'
import { TransactionGraduatedProps } from '@/components/trade/transaction-graduated'
import { usePumpClient } from '@/hooks/usePumpClient'
import { stringifyBigInt } from '@/util'

export const Buy: React.FC<TransactionGraduatedProps> = ({ coin }) => {
  const [error, setError] = useState('')

  const [isPreviewing, setIsPreviewing] = useState(false)
  const [isBuying, setIsBuying] = useState(false)

  const [previewUnitsOut, setPreviewUnitsOut] = useState<bigint | null>(null)

  const [ethInput, setEthInput] = useState('')
  const [weiIn, setWeiIn] = useState<bigint | null>(null)

  const { previewBuy, buyPostGraduation, explorerUrl } = usePumpClient()

  const previewAmountOut = async () => {
    if (!weiIn) {
      return
    }
    console.log('previewing buy')
    console.log(`weiIn: ${weiIn}`)
    console.log(`coin.contractAddress: ${coin.contractAddress}`)
    previewBuy({ token: coin.contractAddress, amountIn: weiIn })
      .then((out) => {
        setPreviewUnitsOut(out)
      })
      .catch((e) => {
        console.log(`preview buy error: ${e}`)
        setError(JSON.stringify(e, stringifyBigInt, 2))
      })
  }

  const buyCoin = () => {
    if (!weiIn) {
      setError('Invalid amount')
      return
    }
    if (isBuying) {
      setError('Already buying')
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
      .catch((e) => {
        setError(e)
      })
      .finally(() => {
        setIsBuying(false)
      })
  }

  useEffect(() => {
    try {
      const ethIn = parseEther(ethInput)
      setWeiIn(ethIn)
    } catch (e) {
      setWeiIn(null)
    }
  }, [ethInput])

  useEffect(() => {
    if (isPreviewing) {
      return
    }
    setIsPreviewing(true)

    previewAmountOut()
      .then()
      .catch((e) => {
        setError(`Failed to simulate sale: ${e}`)
      })
      .finally(() => {
        setIsPreviewing(false)
      })
  }, [weiIn])

  return (
    <>
      <GraduatedAmountInput
        amount={ethInput}
        setAmount={setEthInput}
        placeholder="SET ETH AMOUNT"
      />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <GraduatedTradeButton
        onClick={buyCoin}
        disabled={weiIn === null || isBuying}
        sx={{
          padding: { xs: '50px', sm: '50px', md: '50px', lg: '50px' },
          color: 'var(--creamWhite)',
          backgroundColor: 'green',
          '&:hover': { backgroundColor: 'darkgreen' },
        }}
      >
        {previewUnitsOut
          ? `CONFIRM BUY FOR ${formatUnits(previewUnitsOut, Number(coin.decimals))} ${coin.name.toUpperCase()}`
          : 'Loading estimated price ...'}
      </GraduatedTradeButton>
    </>
  )
}
