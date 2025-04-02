import { useEffect, useState } from 'react'
import { formatEther, parseEther } from 'viem'

import { TradeInnerBox, TradeOuterBox } from '@/components/trade/trade-box'
import { WeiIn } from '@/components/trade/wei-in'
import { useAppState } from '@/hooks/useAppState'
import { usePumpClient } from '@/hooks/usePumpClient'
import { useToastNotifications } from '@/hooks/useToastNotifications'
import { Coin } from '@/types/coin'

import { ExplorerToast } from '../ExplorerToast'
import { NonGraduatedAmountInput } from './amount-input'
import { Refund } from './refund'
import { NonGraduatedTradeButton } from './trade-button'

type TransactionNonGraduatedProps = {
  coin: Coin
}

export const TransactionNonGraduated = ({
  coin,
}: TransactionNonGraduatedProps) => {
  const { notifySuccess, notifyInfo, notifyError } = useToastNotifications()
  const { loaded, waitForTransaction, buyPreGraduation, txUrl } =
    usePumpClient()
  const { loadWeiIn, saveWeiIn } = useAppState()
  const [buyError, setBuyError] = useState<string | null>(null)
  const [buyInputEth, setBuyInputEth] = useState<string>('')
  const [buyAmountWei, setBuyAmountWei] = useState<bigint | null>(null)
  const [isBuying, setIsBuying] = useState(false)

  useEffect(() => {
    if (buyInputEth === '') {
      setBuyAmountWei(null)
      return
    }
    try {
      const inputValueWei = parseEther(buyInputEth)
      setBuyAmountWei(inputValueWei)
    } catch {
      setBuyAmountWei(null)
    }
  }, [buyInputEth])

  const buy = () => {
    if (!loaded) {
      return
    }
    if (!buyAmountWei) {
      setBuyError('Invalid amount')
      return
    }
    setIsBuying(true)
    buyPreGraduation(BigInt(coin.id), buyAmountWei)
      .then((hash) => {
        const url = txUrl(hash)
        if (url) {
          notifyInfo(
            <ExplorerToast url={url} text="Sent buy tx: " hash={hash} />
          )
        } else {
          notifyInfo(`Sent buy tx: ${hash}`)
        }
        return waitForTransaction(hash)
      })
      .then((receipt) => {
        if (receipt.status === 'success') {
          notifySuccess(
            `Spent ${formatEther(buyAmountWei)} ETH on ${coin.name.toUpperCase()}`
          )
          const previousWeiIn = loadWeiIn(coin.id) ?? 0n
          saveWeiIn(coin.id, previousWeiIn + buyAmountWei)
        } else {
          notifyError(`Failed to buy ${coin.name.toUpperCase()}`)
        }
      })
      .catch((e) => {
        setBuyError(`Buy failed: ${e}`)
        notifyError(`Failed to buy ${coin.name.toUpperCase()}`)
      })
      .finally(() => {
        setIsBuying(false)
      })
  }

  return (
    <>
      <WeiIn coin={coin} />
      <TradeOuterBox>
        <TradeInnerBox sx={{ height: 'auto', gap: '16px' }}>
          <NonGraduatedAmountInput
            amount={buyInputEth}
            setAmount={setBuyInputEth}
            placeholder="ENTER ETH AMOUNT"
            decimals={18}
          />
          {buyError && <p style={{ color: 'red' }}>{buyError}</p>}
          <NonGraduatedTradeButton
            onClick={() => {
              buy()
            }}
            disabled={!buyAmountWei || isBuying}
          >
            {isBuying
              ? 'WAITING FOR WALLET APPROVAL'
              : buyAmountWei
                ? `BUY ${formatEther(buyAmountWei)} ETH worth of ${coin.name.toUpperCase()}`
                : 'Enter a valid amount'}
          </NonGraduatedTradeButton>
        </TradeInnerBox>
      </TradeOuterBox>
      <Refund coin={coin} />
    </>
  )
}

export default TransactionNonGraduated
