import { motion } from 'framer-motion'
import { useState } from 'react'

import CoinCard from '@/components/coin/coin-card'
import Pagination from '@/components/coin/pagination'
import type { Coin } from '@/types/coin'

const COINS_PER_PAGE = 24

const Coins: React.FC<{ coins: Coin[] }> = ({ coins }) => {
  const [currentPage, setCurrentPage] = useState(1)

  const indexOfLastCoin = currentPage * COINS_PER_PAGE
  const indexOfFirstCoin = indexOfLastCoin - COINS_PER_PAGE
  const currentCoins = coins.slice(indexOfFirstCoin, indexOfLastCoin)

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {[...currentCoins].map((coin, index) => (
          <motion.div
            key={coin.id}
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            transition={{
              delay: index * 0.05,
              duration: 0.3,
              ease: 'easeInOut',
            }}
            className="relative w-full h-full"
            style={{
              perspective: '1000px',
            }}
          >
            <div
              className="absolute inset-0 w-full h-full"
              style={{
                backgroundColor: 'var(--bgColor)',
                backfaceVisibility: 'hidden',
                borderRadius: '10px',
              }}
            />

            <motion.div
              className="relative w-full h-full"
              style={{
                backfaceVisibility: 'hidden',
              }}
            >
              <CoinCard coin={coin} />
            </motion.div>
          </motion.div>
        ))}
      </div>

      <Pagination
        totalItems={coins.length}
        itemsPerPage={COINS_PER_PAGE}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
    </div>
  )
}

export default Coins
