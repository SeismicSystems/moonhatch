import { useState } from 'react'

import CoinCard from '../coins/coin-card'
import Pagination from '../coins/pagination'
import { Coin } from '../storage/client'

const Coins: React.FC<{ coins: Coin[] }> = ({ coins }) => {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const indexOfLastCoin = currentPage * itemsPerPage
  const indexOfFirstCoin = indexOfLastCoin - itemsPerPage
  const currentCoins = coins.slice(indexOfFirstCoin, indexOfLastCoin)

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="space-y-4">
        {currentCoins.map((coin) => (
          <CoinCard key={coin.id} coin={coin} />
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
