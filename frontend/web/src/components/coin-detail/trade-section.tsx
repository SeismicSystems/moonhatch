import { useSwipeable } from 'react-swipeable'
import { formatEther } from 'viem'

import { Coin } from '@/types/coin'
import BalanceDisplay from '@components/trade/balance-section'
import TransactionGraduated from '@components/trade/transaction-graduated'
import TransactionNonGraduated from '@components/trade/transaction-nongraduated'
import { Box } from '@mui/material'

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
}: TradeSectionProps) {
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      if (coin.graduated) {
        // @ts-expect-error this is fine
        setTradeType('sell')
        // @ts-expect-error this is fine
        setSellAmount('')
      }
    },
    onSwipedRight: () => {
      // @ts-expect-error this is fine
      setTradeType('buy')
      setBuyAmount('')
    },
    trackMouse: true,
  })

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
          />
          {coin && coin.graduated ? (
            <TransactionGraduated
              coin={coin}
              // @ts-expect-error this is fine
              weiIn={weiIn}
              loadingEthIn={loadingEthIn}
              viewEthIn={viewEthIn}
              refreshWeiIn={refreshWeiIn}
              buyAmount={buyAmount}
              setBuyAmount={setBuyAmount}
              buyError={buyError}
              handleBuy={handleBuy}
            />
          ) : (
            <TransactionNonGraduated
              coin={coin}
              // @ts-expect-error this is fine
              weiIn={weiIn}
              loadingEthIn={loadingEthIn}
              viewEthIn={viewEthIn}
              refreshWeiIn={refreshWeiIn}
              buyAmount={buyAmount}
              setBuyAmount={setBuyAmount}
              buyError={buyError}
              handleBuy={handleBuy}
            />
          )}
        </div>
      </Box>
    </div>
  )
}
