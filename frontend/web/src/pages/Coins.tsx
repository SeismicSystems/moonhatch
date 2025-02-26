import { motion } from 'framer-motion'
import { useState } from 'react'

import type { Coin } from '@/types/coin'
import CoinCard from '@/components/coin/coin-card'
import Pagination from '@/components/coin/pagination'

const Coins: React.FC<{ coins: Coin[] }> = ({ coins }) => {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const indexOfLastCoin = currentPage * itemsPerPage
  const indexOfFirstCoin = indexOfLastCoin - itemsPerPage
  const currentCoins = coins.slice(indexOfFirstCoin, indexOfLastCoin)

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {[...currentCoins].reverse().map((coin, index) => (
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
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
    </div>
  )
}

export default Coins
