import React, { useEffect, useState } from 'react'
import { parseEther } from 'viem'

import { ExplorerLink } from '@/components/NotifyExplorer'
import { GraduatedAmountInput } from '@/components/trade/amount-input'
import { GraduatedTradeButton } from '@/components/trade/trade-button'
import { TransactionGraduatedProps } from '@/components/trade/transaction-graduated'
import { usePumpClient } from '@/hooks/usePumpClient'
import { useToastNotifications } from '@/hooks/useToastNotifications'
import { formatUnitsRounded } from '@/util'

export const Buy: React.FC<TransactionGraduatedProps> = ({ coin }) => {
  const [error, setError] = useState('')

  const [isPreviewing, setIsPreviewing] = useState(false)
  const [isBuying, setIsBuying] = useState(false)

  const [previewWeiIn, setPreviewWeiIn] = useState<bigint | null>(null)
  const [previewUnitsOut, setPreviewUnitsOut] = useState<bigint | null>(null)

  const [ethInput, setEthInput] = useState('')
  const [weiIn, setWeiIn] = useState<bigint | null>(null)

  const { previewBuy, buyPostGraduation, txUrl, waitForTransaction } =
    usePumpClient()

  const { notifySuccess, notifyInfo, notifyWarning, notifyError } =
    useToastNotifications()

  const buyCoin = () => {
    if (!weiIn) {
      setError('Invalid amount')
      notifyWarning('Invalid amount')
      return
    }
    if (isBuying) {
      setError('Already buying')
      notifyWarning('Already buying')
      return
    }
    setIsBuying(true)

    buyPostGraduation({ token: coin.contractAddress, amountIn: weiIn })
      .then((buyTxHash) => {
        const url = txUrl(buyTxHash)
        if (url) {
          notifyInfo(
            <ExplorerLink url={url} text="Sent buy tx: " hash={buyTxHash} />
          )
        } else {
          notifyInfo(`Sent buy tx: ${buyTxHash}`)
        }
        return waitForTransaction(buyTxHash)
      })
      .then((buyReceipt) => {
        const url = txUrl(buyReceipt.transactionHash)
        if (url) {
          notifySuccess(
            <ExplorerLink
              url={url}
              text="Buy confirmed: "
              hash={buyReceipt.transactionHash}
            />
          )
        } else {
          notifySuccess(`Buy confirmed: ${buyReceipt.transactionHash}`)
        }
      })
      .catch((e) => {
        setError(e)
        notifyError(`Failed to buy: ${e}`)
      })
      .finally(() => {
        setIsBuying(false)
      })
  }

  useEffect(() => {
    try {
      const ethIn = parseEther(ethInput)
      setWeiIn(ethIn)
    } catch {
      setWeiIn(null)
    }
  }, [ethInput])

  useEffect(() => {
    if (isPreviewing) {
      return
    }
    if (!weiIn) {
      setPreviewWeiIn(null)
      setPreviewUnitsOut(null)
      return
    }
    if (weiIn === previewWeiIn) {
      return
    }

    setIsPreviewing(true)
    previewBuy({ token: coin.contractAddress, amountIn: weiIn })
      .then((out) => {
        setPreviewWeiIn(weiIn)
        setPreviewUnitsOut(out)
      })
      .catch((e) => {
        setError(`Failed to simulate sale: ${e}`)
        notifyWarning(`Failed to simulate sale: ${e}`)
      })
      .finally(() => {
        setIsPreviewing(false)
      })
  }, [
    isPreviewing,
    weiIn,
    previewWeiIn,
    coin.contractAddress,
    previewBuy,
    notifyWarning,
  ])

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
        {isBuying
          ? 'WAITING FOR WALLET APPROVAL'
          : previewUnitsOut
            ? `CONFIRM BUY FOR ${formatUnitsRounded(previewUnitsOut, Number(coin.decimals))} ${coin.name.toUpperCase()}`
            : 'Loading estimated price ...'}
      </GraduatedTradeButton>
    </>
  )
}
