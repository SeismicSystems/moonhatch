import { useMemo, useState } from 'react'
import { useSwipeable } from 'react-swipeable'
import { formatEther } from 'viem'

import CachedIcon from '@mui/icons-material/Cached'
import VisibilityIcon from '@mui/icons-material/Visibility'
import { Box, Modal } from '@mui/material'

import { Coin } from '../../types/coin'
import BalanceDisplay from '../trade/balance-section'
import TransactionGraduated from '../trade/transaction-graduated'
import TransactionNonGraduated from '../trade/transaction-nongraduated'

interface TradeSectionProps {
  coin: Coin
  weiIn: bigint | null
  loadingEthIn: boolean
  viewEthIn: () => Promise<void>
  refreshWeiIn: () => Promise<void>
  buyAmount: string
  setBuyAmount: React.Dispatch<React.SetStateAction<string>>
  buyError: string | null
  handleBuy: () => Promise<void>
  modalOpen: boolean
  modalMessage: string
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export default function TradeSection({
  coin,
  weiIn,
  loadingEthIn,
  viewEthIn,
  refreshWeiIn,
  buyAmount,
  setBuyAmount,
  buyError,
  handleBuy,
  modalOpen,
  modalMessage,
  setModalOpen,
}: TradeSectionProps) {
  const [isBalanceVisible, setIsBalanceVisible] = useState(false)
  // tradeType: either 'buy' or 'sell' (or null if not yet selected)
  const [tradeType, setTradeType] = useState<'buy' | 'sell' | null>(null)
  // Use parent's buyAmount for BUY orders and local state for SELL orders.
  const [sellAmount, setSellAmount] = useState('')

  // Dummy conversion rate: 1 ETH = 1000 Coin X
  const conversionRate = 1000

  // For BUY mode: use parent's buyAmount
  const estimatedBuy = useMemo(() => {
    const inputValue = parseFloat(buyAmount)
    return isNaN(inputValue) || inputValue <= 0
      ? 0
      : inputValue * conversionRate
  }, [buyAmount, conversionRate])

  // For SELL mode: use local sellAmount
  const estimatedSell = useMemo(() => {
    const inputValue = parseFloat(sellAmount)
    return isNaN(inputValue) || inputValue <= 0
      ? 0
      : inputValue / conversionRate
  }, [sellAmount, conversionRate])

  // Handle switching trade type and resetting the appropriate input fields
  const handleTrade = (type: 'buy' | 'sell') => {
    setTradeType(type)
    if (type === 'buy') {
      setBuyAmount('')
    } else {
      setSellAmount('')
    }
  }

  // Overall swipe for the component (you can still have this if you wish)
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      if (coin.graduated) {
        setTradeType('sell')
        setSellAmount('')
      }
    },
    onSwipedRight: () => {
      setTradeType('buy')
      setBuyAmount('')
    },
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  })

  // Dedicated swipe handlers for the toggle group
  const toggleSwipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      if (coin.graduated) {
        handleTrade('sell')
      }
    },
    onSwipedRight: () => {
      handleTrade('buy')
    },
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  })

  const handleViewBalance = () => {
    if (!isBalanceVisible) {
      setIsBalanceVisible(true)
      viewEthIn()
    }
  }

  return (
    <div {...swipeHandlers} className="flex flex-col items-center w-full">
      <Box
        sx={{
          marginBottom: 4,
          width: { xs: '300px', sm: '450px' },
        }}
      >
        <div className="w-full flex flex-col items-center text-center gap-2">
          {/* Balance Display & Refresh Section */}
          <BalanceDisplay
            coin={coin}
            balance={weiIn ? formatEther(weiIn) : null}
            refreshBalance={refreshWeiIn}
            loading={loadingEthIn}
            onReveal={viewEthIn} // optional: call viewEthIn when the balance is revealed
          />
          {/* Stylized Trade Mode Toggle with Swipe */}
          {coin && coin.graduated ? (
            <TransactionGraduated
              coin={coin}
              weiIn={weiIn}
              loadingEthIn={loadingEthIn}
              viewEthIn={viewEthIn}
              refreshWeiIn={refreshWeiIn}
              buyAmount={buyAmount}
              setBuyAmount={setBuyAmount}
              buyError={buyError}
              handleBuy={handleBuy}
              modalOpen={modalOpen}
              modalMessage={modalMessage}
              setModalOpen={setModalOpen}
            />
          ) : (
            <TransactionNonGraduated
              coin={coin}
              weiIn={weiIn}
              loadingEthIn={loadingEthIn}
              viewEthIn={viewEthIn}
              refreshWeiIn={refreshWeiIn}
              buyAmount={buyAmount}
              setBuyAmount={setBuyAmount}
              buyError={buyError}
              handleBuy={handleBuy}
              modalOpen={modalOpen}
              modalMessage={modalMessage}
              setModalOpen={setModalOpen}
            />
          )}
        </div>
      </Box>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Box className="p-4 bg-white border rounded shadow-lg text-center">
          <h2 className="text-lg font-bold">Warning</h2>
          <p>{modalMessage}</p>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
            onClick={() => setModalOpen(false)}
          >
            OK
          </button>
        </Box>
      </Modal>
    </div>
  )
}
