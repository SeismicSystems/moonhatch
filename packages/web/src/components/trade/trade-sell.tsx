import React, { useEffect, useState } from 'react'
import { formatEther, parseUnits } from 'viem'

import { ExplorerToast } from '@/components/ExplorerToast'
import { GraduatedAmountInput } from '@/components/trade/amount-input'
import { GraduatedTradeButton } from '@/components/trade/trade-button'
import { TransactionGraduatedProps } from '@/components/trade/transaction-graduated'
import { useAppState } from '@/hooks/useAppState'
import { usePumpClient } from '@/hooks/usePumpClient'
import { useToastNotifications } from '@/hooks/useToastNotifications'

const SellButtonText: React.FC<{
  previewUnitsIn: bigint | null
  previewWeiOut: bigint | null
  isSelling: boolean
}> = ({ previewUnitsIn, previewWeiOut, isSelling }) => {
  if (previewUnitsIn === null) {
    return 'Enter an amount'
  }

  return (
    <>
      {isSelling
        ? 'Waiting for wallet approval...'
        : previewWeiOut
          ? `CONFIRM SELL. ESTIMATED ETH: ${formatEther(previewWeiOut)} ETH`
          : 'Loading estimated ...'}
    </>
  )
}

export const Sell: React.FC<TransactionGraduatedProps> = ({ coin }) => {
  const { previewSell, checkApproval, sell, txUrl, waitForTransaction } =
    usePumpClient()
  const { deleteBalance } = useAppState()
  const { notifySuccess, notifyInfo, notifyWarning, notifyError } =
    useToastNotifications()

  const [error, setError] = useState('')

  const [isPreviewing, setIsPreviewing] = useState(false)
  const [isSelling, setIsSelling] = useState(false)

  const [previewUnitsIn, setPreviewUnitsIn] = useState<bigint | null>(null)
  const [previewWeiOut, setPreviewWeiOut] = useState<bigint | null>(null)

  const [amountInput, setAmountInput] = useState('')
  const [amountIn, setAmountIn] = useState<bigint | null>(null)

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
            <ExplorerToast
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
        const success = approvalReceipt.status === 'success'
        const url = txUrl(approvalReceipt.transactionHash)
        let toastContent: string | React.ReactNode = `Approved confirmed: `
        if (!success) {
          toastContent = `Approved failed: `
        }
        if (url) {
          toastContent = (
            <ExplorerToast
              url={url}
              text="Approved confirmed: "
              hash={approvalReceipt.transactionHash}
            />
          )
        } else {
          toastContent += approvalReceipt.transactionHash
        }
        if (success) {
          notifySuccess(toastContent)
        } else {
          notifyError(toastContent)
        }
      })
      .then(() => sell({ token: coin.contractAddress, amountIn }))
      .then((sellTxHash) => {
        const url = txUrl(sellTxHash)
        if (url) {
          notifyInfo(
            <ExplorerToast url={url} text="Sent sell tx: " hash={sellTxHash} />
          )
        } else {
          notifyInfo(`Sent sell tx: ${sellTxHash}`)
        }
        return waitForTransaction(sellTxHash)
      })
      .then((sellReceipt) => {
        const success = sellReceipt.status === 'success'
        const url = txUrl(sellReceipt.transactionHash)
        let toastContent: string | React.ReactNode = `Sell confirmed: `
        if (!success) {
          toastContent = `Sell failed: `
        }
        if (url) {
          toastContent = (
            <ExplorerToast
              url={url}
              text="Sell confirmed: "
              hash={sellReceipt.transactionHash}
            />
          )
        } else {
          toastContent += sellReceipt.transactionHash
        }
        if (success) {
          notifySuccess(toastContent)
          deleteBalance(coin.contractAddress)
        } else {
          notifyError(toastContent)
        }
      })
      .catch((e) => {
        setError(e.message)
        notifyError(`Failed to sell: ${e.message}`)
      })
      .finally(() => {
        setAmountInput('')
        setAmountIn(null)
        setPreviewUnitsIn(null)
        setPreviewWeiOut(null)
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
      .then((weiOut) => {
        setPreviewWeiOut(weiOut)
        setPreviewUnitsIn(amountIn)
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
        <SellButtonText
          previewUnitsIn={previewUnitsIn}
          previewWeiOut={previewWeiOut}
          isSelling={isSelling}
        />
      </GraduatedTradeButton>
    </>
  )
}
