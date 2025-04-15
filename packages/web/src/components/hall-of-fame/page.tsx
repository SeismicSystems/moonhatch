import { useEffect, useState } from 'react'

import NavBar from '@/components/NavBar'
import {
  Box,
  Button,
  CircularProgress,
  Pagination,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'

export default function HallOfFame() {
  const [data, setData] = useState<
    Array<{ symbol: string; name: string; price: number; marketcap: number }>
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
        symbol: `TICKER${i + 123}`,
        name: `COIN_NAME${i + 1}`,
        price: Math.floor(Math.random() * 10000),
        marketcap: Math.floor(Math.random() * 10000) * 1000,
      }))

      // Sort by score (highest first)
      mockData.sort((a, b) => b.marketcap - a.marketcap)

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
  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    page: number
  ) => {
    setCurrentPage(page)
  }

  return (
    <Box className="hof-page-container flex flex-col items-center">
      <NavBar />
      <Box className="flex justify-between items-center mb-6" width="70dvw">
        <Typography variant="h5" className="font-bold text-[#f1dac4]">
          Hall of Fame
        </Typography>
        <Button
          onClick={generateMockData}
          disabled={loading}
          sx={{
            px: 2,
            py: 1,
            bgcolor: '#474973',
            color: '#f1dac4',
            borderRadius: 1,
            '&:hover': {
              bgcolor: '#161b33',
            },
            '&.Mui-disabled': {
              opacity: 0.5,
            },
          }}
        >
          {loading ? 'Refreshing...' : 'Refresh Data'}
        </Button>
      </Box>

      {loading ? (
        <Box className="text-center py-10 text-[#f1dac4]">
          <CircularProgress sx={{ color: '#f1dac4' }} />
        </Box>
      ) : (
        <>
          <TableContainer
            component={Paper}
            sx={{
              width: '70dvw',
              bgcolor: '#0d0c1d',
              border: '1px solid #474973',
              borderRadius: 1,
              overflow: 'auto',
            }}
          >
            <Table>
              <TableHead sx={{ bgcolor: '#161b33' }}>
                <TableRow>
                  <TableCell
                    align="center"
                    sx={{
                      py: 1,
                      px: 2,
                      borderBottom: '1px solid #474973',
                      color: '#f1dac4',
                    }}
                  >
                    SYMBOL
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      py: 1,
                      px: 2,
                      borderBottom: '1px solid #474973',
                      color: '#f1dac4',
                    }}
                  >
                    NAME
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      py: 1,
                      px: 2,
                      borderBottom: '1px solid #474973',
                      color: '#f1dac4',
                    }}
                  >
                    PRICE
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      py: 1,
                      px: 2,
                      borderBottom: '1px solid #474973',
                      color: '#f1dac4',
                    }}
                  >
                    MARKETCAP
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {getCurrentPageData().map((item, index) => (
                  <TableRow
                    key={item.symbol}
                    sx={{ bgcolor: index % 2 === 0 ? '#0d0c1d' : '#161b33' }}
                  >
                    <TableCell
                      sx={{
                        py: 1,
                        px: 2,
                        borderBottom: '1px solid #474973',
                        color: '#f1dac4',
                      }}
                    >
                      {item.symbol}
                    </TableCell>
                    <TableCell
                      sx={{
                        py: 1,
                        px: 2,
                        borderBottom: '1px solid #474973',
                        color: '#f1dac4',
                      }}
                    >
                      {item.name}
                    </TableCell>
                    <TableCell
                      sx={{
                        py: 1,
                        px: 2,
                        borderBottom: '1px solid #474973',
                        color: '#f1dac4',
                      }}
                    >
                      {item.price}
                    </TableCell>
                    <TableCell
                      sx={{
                        py: 1,
                        px: 2,
                        borderBottom: '1px solid #474973',
                        color: '#f1dac4',
                      }}
                    >
                      {item.marketcap}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box
            className="flex justify-between items-center mt-4"
            sx={{ color: '#a69cac', width: '70dvw' }}
          >
            <Typography variant="body2">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, data.length)} of{' '}
              {data.length} entries
            </Typography>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              sx={{
                '& .MuiPaginationItem-root': {
                  color: '#f1dac4',
                  borderColor: '#474973',
                  backgroundColor: '#161b33',
                  '&:hover': {
                    backgroundColor: '#474973',
                  },
                  '&.Mui-selected': {
                    backgroundColor: '#474973',
                  },
                },
              }}
            />
          </Box>
        </>
      )}
    </Box>
  )
}
