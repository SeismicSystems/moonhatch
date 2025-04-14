import { useEffect, useState } from 'react'

export default function HallOfFame() {
  const [data, setData] = useState<
    Array<{ id: number; name: string; score: number; date: string }>
  >([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const itemsPerPage = 10
  const [loading, setLoading] = useState(false)

  // Function to generate mock data
  const generateMockData = () => {
    setLoading(true)

    // Simulate API call delay
    setTimeout(() => {
      const mockData = Array.from({ length: 50 }, (_, i) => ({
        id: i + 1,
        name: `Player ${i + 1}`,
        score: Math.floor(Math.random() * 10000),
        date: new Date(
          Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000
        ).toLocaleDateString(),
      }))

      // Sort by score (highest first)
      mockData.sort((a, b) => b.score - a.score)

      setData(mockData)
      setTotalPages(Math.ceil(mockData.length / itemsPerPage))
      setLoading(false)
    }, 500)
  }

  // Initial data load
  useEffect(() => {
    generateMockData()
  }, [])

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(
      () => {
        generateMockData()
      },
      5 * 60 * 1000
    ) // 5 minutes in milliseconds

    return () => clearInterval(interval)
  }, [])

  // Get current page data
  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return data.slice(startIndex, endIndex)
  }

  // Handle page navigation
  const goToPage = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#f1dac4]">Hall of Fame</h1>
        <button
          onClick={generateMockData}
          className="px-4 py-2 bg-[#474973] text-[#f1dac4] rounded hover:bg-[#161b33] transition-colors"
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10 text-[#f1dac4]">Loading...</div>
      ) : (
        <>
          <div className="overflow-x-auto rounded border border-[#474973]">
            <table className="min-w-full bg-[#0d0c1d]">
              <thead className="bg-[#161b33]">
                <tr>
                  <th className="py-2 px-4 border-b border-[#474973] text-left text-[#f1dac4]">
                    Rank
                  </th>
                  <th className="py-2 px-4 border-b border-[#474973] text-left text-[#f1dac4]">
                    Player
                  </th>
                  <th className="py-2 px-4 border-b border-[#474973] text-left text-[#f1dac4]">
                    Score
                  </th>
                  <th className="py-2 px-4 border-b border-[#474973] text-left text-[#f1dac4]">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {getCurrentPageData().map((item, index) => (
                  <tr
                    key={item.id}
                    className={
                      index % 2 === 0 ? 'bg-[#0d0c1d]' : 'bg-[#161b33]'
                    }
                  >
                    <td className="py-2 px-4 border-b border-[#474973] text-[#f1dac4]">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="py-2 px-4 border-b border-[#474973] text-[#f1dac4]">
                      {item.name}
                    </td>
                    <td className="py-2 px-4 border-b border-[#474973] text-[#f1dac4]">
                      {item.score.toLocaleString()}
                    </td>
                    <td className="py-2 px-4 border-b border-[#474973] text-[#f1dac4]">
                      {item.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center mt-4 text-[#a69cac]">
            <div>
              Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, data.length)} of{' '}
              {data.length} entries
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => goToPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-[#474973] rounded disabled:opacity-50 text-[#f1dac4] bg-[#161b33] hover:bg-[#474973] transition-colors"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`px-3 py-1 border border-[#474973] rounded text-[#f1dac4] ${
                      currentPage === page
                        ? 'bg-[#474973]'
                        : 'bg-[#161b33] hover:bg-[#474973]'
                    } transition-colors`}
                  >
                    {page}
                  </button>
                )
              )}
              <button
                onClick={() => goToPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-[#474973] rounded disabled:opacity-50 text-[#f1dac4] bg-[#161b33] hover:bg-[#474973] transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
