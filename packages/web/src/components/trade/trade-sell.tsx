import React, { useEffect, useState } from 'react'
import { formatEther, parseUnits } from 'viem'

import { ExplorerLink } from '@/components/NotifyExplorer'
import { GraduatedAmountInput } from '@/components/trade/amount-input'
import { GraduatedTradeButton } from '@/components/trade/trade-button'
import { TransactionGraduatedProps } from '@/components/trade/transaction-graduated'
import { usePumpClient } from '@/hooks/usePumpClient'
import { useToastNotifications } from '@/hooks/useToastNotifications'
import { stringifyBigInt } from '@/util'

export const Sell: React.FC<TransactionGraduatedProps> = ({ coin }) => {
  const [error, setError] = useState('')

  const [isPreviewing, setIsPreviewing] = useState(false)
  const [isSelling, setIsSelling] = useState(false)

  const [previewUnitsIn, setPreviewUnitsIn] = useState<bigint | null>(null)
  const [previewWeiOut, setPreviewWeiOut] = useState<bigint | null>(null)

  const [amountInput, setAmountInput] = useState('')
  const [amountIn, setAmountIn] = useState<bigint | null>(null)

  const { previewSell, checkApproval, sell, txUrl, waitForTransaction } =
    usePumpClient()

  const { notifySuccess, notifyInfo, notifyWarning, notifyError } =
    useToastNotifications()

  const sellCoin = () => {
    if (!amountIn) {
      setError('Invalid amount')
      notifyWarning('Invalid amount')
      return
    }
    if (isSelling) {
      setError('Already selling')
      notifyWarning('Already selling')
      return
    }
    setIsSelling(true)

    checkApproval({ token: coin.contractAddress, amountIn })
      .then((approveTxHash) => {
        if (!approveTxHash) {
          return
        }

        const url = txUrl(approveTxHash)
        if (url) {
          notifyInfo(
            <ExplorerLink
              url={url}
              text="Sent approval tx: "
              hash={approveTxHash}
            />
          )
        } else {
          notifyInfo(`Sent approval tx: ${approveTxHash}`)
        }
        return waitForTransaction(approveTxHash)
      })
      .then((approvalReceipt) => {
        if (!approvalReceipt) {
          return
        }
        const url = txUrl(approvalReceipt.transactionHash)
        if (url) {
          notifySuccess(
            <ExplorerLink
              url={url}
              text="Approved confirmed: "
              hash={approvalReceipt.transactionHash}
            />
          )
        } else {
          notifySuccess(
            `Approved confirmed: ${approvalReceipt.transactionHash}`
          )
        }
      })
      .then(() => sell({ token: coin.contractAddress, amountIn }))
      .then((sellTxHash) => {
        const url = txUrl(sellTxHash)
        if (url) {
          notifyInfo(
            <ExplorerLink url={url} text="Sent sell tx: " hash={sellTxHash} />
          )
        } else {
          notifyInfo(`Sent sell tx: ${sellTxHash}`)
        }
        return waitForTransaction(sellTxHash)
      })
      .then((sellReceipt) => {
        const url = txUrl(sellReceipt.transactionHash)
        if (url) {
          notifySuccess(
            <ExplorerLink
              url={url}
              text="Sell confirmed: "
              hash={sellReceipt.transactionHash}
            />
          )
        } else {
          notifySuccess(`Sell confirmed: ${sellReceipt.transactionHash}`)
        }
      })
      .catch((e) => {
        setError(JSON.stringify(e, stringifyBigInt, 2))
        notifyError(`Failed to sell: ${e}`)
      })
      .finally(() => {
        setIsSelling(false)
      })
  }

  useEffect(() => {
    try {
      const amountIn = parseUnits(amountInput, Number(coin.decimals))
      setAmountIn(amountIn)
    } catch {
      setAmountIn(null)
    }
  }, [amountInput, coin.decimals])

  useEffect(() => {
    if (isPreviewing) {
      return
    }
    if (!amountIn) {
      setPreviewUnitsIn(null)
      setPreviewWeiOut(null)
      return
    }

    if (amountIn === previewUnitsIn) {
      return
    }

    setIsPreviewing(true)
    previewSell({
      token: coin.contractAddress,
      amountIn,
    })
      .then()
      .catch((e) => {
        setError(`Failed to simulate sale: ${e}`)
        notifyWarning(`Failed to simulate sale: ${e}`)
      })
      .finally(() => {
        setIsPreviewing(false)
      })
  }, [
    isPreviewing,
    amountIn,
    previewUnitsIn,
    coin.contractAddress,
    previewSell,
    notifyWarning,
  ])

  return (
    <>
      <GraduatedAmountInput
        amount={amountInput}
        setAmount={setAmountInput}
        placeholder={`ENTER ${coin.name.toUpperCase()} AMOUNT`}
      />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <GraduatedTradeButton
        onClick={() => {
          setIsSelling(true)
          sellCoin()
        }}
        disabled={amountIn === null || isSelling}
        sx={{
          padding: { xs: '8px', sm: '10px', md: '12px', lg: '14px' },
          color: 'white',
          backgroundColor: 'red',
          '&:hover': { backgroundColor: 'darkred' },
        }}
      >
        {isSelling
          ? 'Waiting for wallet approval...'
          : previewWeiOut
            ? `CONFIRM SELL. ESTIMATED ETH: ${formatEther(previewWeiOut)} ETH`
            : 'Loading estimated ...'}
      </GraduatedTradeButton>
    </>
  )
}
