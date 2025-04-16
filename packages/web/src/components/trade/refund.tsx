import { useEffect, useState } from 'react'

import { useAppState } from '@/hooks/useAppState'
import { usePumpClient } from '@/hooks/usePumpClient'
import { useToastNotifications } from '@/hooks/useToastNotifications'
import { Coin } from '@/types/coin'

import { ExplorerToast } from '../ExplorerToast'

export const Refund: React.FC<{ coin: Coin }> = ({ coin }) => {
  const { loaded, refundPurchase, waitForTransaction, txUrl } = usePumpClient()
  const { loadWeiIn, saveWeiIn } = useAppState()
  const { notifySuccess, notifyInfo, notifyError } = useToastNotifications()

  const [refunding, setRefunding] = useState(false)
  const [disabled, setDisabled] = useState(false)
  const [weiIn, setWeiIn] = useState<bigint | null>(null)

  useEffect(() => {
    if (weiIn === 0n) {
      setDisabled(true)
      return
    }
    setDisabled(false)
  }, [weiIn])

  useEffect(() => {
    setWeiIn(loadWeiIn(coin.id))
  }, [coin.id, loadWeiIn])

  const refund = () => {
    if (!loaded || refunding) return
    setRefunding(true)
    refundPurchase(BigInt(coin.id))
      .then((hash) => {
        const url = txUrl(hash)
        if (url) {
          notifyInfo(
            <ExplorerToast url={url} text="Sent refund tx: " hash={hash} />
          )
        } else {
          notifyInfo(`Sent refund tx: ${hash}`)
        }
        return waitForTransaction(hash)
      })
      .then((receipt) => {
        if (receipt.status === 'success') {
          setWeiIn(0n)
          saveWeiIn(coin.id, 0n)
          notifySuccess('Refund successful')
        } else {
          notifyError('Refund failed')
        }
      })
      .finally(() => {
        setRefunding(false)
      })
  }

  return (
    <button
      className="h-[5dvh] "
      style={{
        width: '85%',
        height: 'auto',
        padding: '1rem',
        backgroundColor: disabled ? '#FF9999' : '#FF0038',
        border: 'none',
        borderRadius: '4rem',
        cursor: disabled ? 'not-allowed' : 'pointer',
        color: disabled ? 'black' : 'var(--creamWhite)',
      }}
      onClick={refund}
      disabled={disabled}
    >
      {refunding
        ? '...REFUNDING...'
        : disabled
          ? 'NOTHING TO REFUND'
          : 'REFUND'}
    </button>
  )
}
