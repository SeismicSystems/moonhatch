import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { ChevronLeft } from 'lucide-react'
import { useState } from 'react'
import ReactPaginate from 'react-paginate'

import CoinCard from '@/components/coin/coin-card'
import type { Coin } from '@/types/coin'

const COINS_PER_PAGE = 24

const Coins: React.FC<{ coins: Coin[] }> = ({ coins }) => {
  const [currentPage, setCurrentPage] = useState(1)

  const indexOfLastCoin = currentPage * COINS_PER_PAGE
  const indexOfFirstCoin = indexOfLastCoin - COINS_PER_PAGE
  const currentCoins = coins.slice(indexOfFirstCoin, indexOfLastCoin)

  const handlePageChange = (selectedPage: { selected: number }) => {
    setCurrentPage(selectedPage.selected + 1)
  }

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

      <ReactPaginate
        previousLabel={<ChevronLeft />}
        nextLabel={<ChevronRight />}
        pageCount={Math.ceil(coins.length / COINS_PER_PAGE)}
        onPageChange={handlePageChange}
        pageRangeDisplayed={5}
        marginPagesDisplayed={2}
        containerClassName="flex justify-center items-center mt-4"
        pageClassName="mx-2 px-4 py-2 border rounded-md"
        activeClassName="bg-blue-500 text-white"
      />
    </div>
  )
}

export default Coins
