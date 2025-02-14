import { motion } from 'framer-motion'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { Coin } from '@/types/coin'
import CoinCard from '@components/coin/coin-card'
import Pagination from '@components/coin/pagination'

const Coins: React.FC<{ coins: Coin[] }> = ({ coins }) => {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const indexOfLastCoin = currentPage * itemsPerPage
  const indexOfFirstCoin = indexOfLastCoin - itemsPerPage
  const currentCoins = coins.slice(indexOfFirstCoin, indexOfLastCoin)

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="space-y-4">
        {[...currentCoins].reverse().map((coin, index) => (
          <motion.div
            key={coin.id}
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.2, duration: 1.0 }}
            className="block" // ensures the motion.div is block-level so space-y-4 applies
          >
            <Link to={`/coin/${coin.id}`} className="block">
              <CoinCard coin={coin} />
            </Link>
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
