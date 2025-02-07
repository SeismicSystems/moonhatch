import { formatEther } from 'viem'

import { Box, Modal } from '@mui/material'

import { Coin } from '../../types/coin'

interface TradeSectionProps {
  coin: Pick<Coin, 'id' | 'graduated'>
  weiIn: bigint | null
  loadingEthIn: boolean
  viewEthIn: () => void
  refreshWeiIn: () => void
  buyAmount: string
  setBuyAmount: (value: string) => void
  buyError: string | null
  handleBuy: () => void
  modalOpen: boolean
  modalMessage: string
  setModalOpen: (open: boolean) => void
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
  console.log(
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
    setModalOpen
  )
  return (
    <>
      <Box
        height="100px"
        width="100px"
        sx={{ background: 'black', p: 1, mt: 2 }}
      >
        <div className="text-white">VIEW BALANCE</div>
        {coin.graduated ? (
          <button
            className="text-white"
            onClick={() => console.log('View Balance (0)')}
          >
            View Balance ({weiIn ? formatEther(weiIn) : 0})
          </button>
        ) : (
          <>
            {weiIn !== null ? (
              <div className="text-green-600 font-bold">
                {formatEther(weiIn)}
              </div>
            ) : loadingEthIn ? (
              <div className="text-gray-500 text-sm">Waiting...</div>
            ) : (
              <button
                className="bg-blue-600 text-white py-2 px-4 rounded"
                onClick={viewEthIn}
              >
                View ETH
              </button>
            )}
            <button
              className="bg-blue-600 text-white py-2 px-4 rounded"
              onClick={refreshWeiIn}
            >
              Refresh WeiIn
            </button>
          </>
        )}
      </Box>

      {!coin.graduated && (
        <div className="trade my-4">
          <input
            type="text"
            value={buyAmount}
            onChange={(e) => setBuyAmount(e.target.value)}
            placeholder="Enter amount (max 1 ETH)"
            className="border border-gray-300 p-2 rounded mb-2"
          />
          {buyError && <p className="text-red-500 text-sm">{buyError}</p>}
          <button
            className="bg-green-500 text-white px-4 py-2 rounded"
            onClick={handleBuy}
          >
            Buy
          </button>
        </div>
      )}
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
    </>
  )
}
