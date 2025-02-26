import { useEffect, useState } from 'react'
import { Coin } from '@/types/coin'
import { ModalBox } from '@/components/trade/modal-box'
import { TradeInnerBox, TradeOuterBox } from '@/components/trade/trade-box'
import { NonGraduatedAmountInput } from './amount-input'
import { NonGraduatedTradeButton } from './trade-button'
import { formatEther, parseEther } from 'viem'
import { WeiIn } from '@/components/trade/wei-in'
import { usePumpClient } from '@/hooks/usePumpClient'

type TransactionNonGraduatedProps = {
  coin: Coin,
  modalOpen: boolean
  modalMessage: string
  setModalOpen: (open: boolean) => void
}

export default function TransactionNonGraduated({
  coin,
  modalOpen,
  modalMessage,
  setModalOpen,
}: TransactionNonGraduatedProps) {

  const [buyError, setBuyError] = useState<string | null>(null)
  const [buyInputEth, setBuyInputEth] = useState<string>('')
  const [buyAmountWei, setBuyAmountWei] = useState<bigint | null>(null)
  const { buyPreGraduation } = usePumpClient()

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
    if (!buyAmountWei) {
      setBuyError('Invalid amount')
      return
    }
    buyPreGraduation(coin.id, buyAmountWei).then((hash) => {
      console.log(`Send tx to chain: ${hash}`)
    }).catch((e) => {
      setBuyError(`Buy failed: ${e}`)
    })
  }

  return (
    <>
      <WeiIn coin={coin} />
      <TradeOuterBox>
        <TradeInnerBox sx={{ height: 'auto', gap: '16px' }}>
          <NonGraduatedAmountInput amount={buyInputEth} setAmount={setBuyInputEth} placeholder="ENTER ETH AMOUNT" />
          {buyError && <p style={{ color: 'red' }}>{buyError}</p>}
          <NonGraduatedTradeButton
            onClick={buy}
            disabled={!buyAmountWei}
          >
            {buyAmountWei
              ? `BUY ${formatEther(buyAmountWei)} ETH worth of ${coin.name.toUpperCase()}`
              : 'Enter a valid amount'}
          </NonGraduatedTradeButton>
        </TradeInnerBox>
        <ModalBox modalOpen={modalOpen} setModalOpen={setModalOpen}>
          <h2 style={{ fontWeight: 'bold' }}>Warning</h2>
          <p>{modalMessage}</p>
          <button
            style={{
              backgroundColor: 'blue',
              color: 'white',
              padding: '8px 16px',
              border: 'none',
              borderRadius: '4px',
              marginTop: '16px',
              cursor: 'pointer',
            }}
            onClick={() => setModalOpen(false)}
          >
            OK
          </button>
        </ModalBox>
      </TradeOuterBox>
    </>

  )
}
