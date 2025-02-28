import { useEffect, useState } from 'react'
import { set } from 'react-hook-form'
import { formatEther, parseEther } from 'viem'

import { TradeInnerBox, TradeOuterBox } from '@/components/trade/trade-box'
import { WeiIn } from '@/components/trade/wei-in'
import { usePumpClient } from '@/hooks/usePumpClient'
import { Coin } from '@/types/coin'

import { NonGraduatedAmountInput } from './amount-input'
import { NonGraduatedTradeButton } from './trade-button'

type TransactionNonGraduatedProps = {
  coin: Coin
}

export const TransactionNonGraduated = ({
  coin,
}: TransactionNonGraduatedProps) => {
  const [buyError, setBuyError] = useState<string | null>(null)
  const [buyInputEth, setBuyInputEth] = useState<string>('')
  const [buyAmountWei, setBuyAmountWei] = useState<bigint | null>(null)
  const { buyPreGraduation } = usePumpClient()
  const [isBuying, setIsBuying] = useState(false)

  useEffect(() => {
    if (buyInputEth === '') {
      setBuyAmountWei(null)
      return
    }
    try {
      const inputValueWei = parseEther(buyInputEth)
      setBuyAmountWei(inputValueWei)
    } catch (error) {
      setBuyAmountWei(null)
    }
  }, [buyInputEth])

  const buy = () => {
    setIsBuying(true)

    if (!buyAmountWei) {
      setBuyError('Invalid amount')
      return
    }
    buyPreGraduation(coin.id, buyAmountWei)
      .then((hash) => {
        console.log(`Send tx to chain: ${hash}`)
      })
      .catch((e) => {
        setBuyError(`Buy failed: ${e}`)
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
    </>
  )
}

export default TransactionNonGraduated
