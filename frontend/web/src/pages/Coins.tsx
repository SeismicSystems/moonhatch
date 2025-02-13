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
      <div className="space-y-4 ">
        {currentCoins.reverse().map((coin) => (
          <Link
            key={coin.id}
            className="block border-[var(--lightBlue)] border-4 rounded-2xl"
            to={`/coins/${coin.id}`}
          >
            <CoinCard coin={coin} />
          </Link>
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
