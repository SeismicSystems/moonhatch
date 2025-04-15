import { useEffect, useState } from 'react'

import NavBar from '@/components/NavBar'
import {
  Box,
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
  const itemsPerPage = 20
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
      <Box
        className="flex justify-center items-center mb-6"
        sx={{
          width: '70dvw',
          marginTop: '2rem',
        }}
      >
        <Typography
          variant="h1"
          className="font-bold text-[#f1dac4] text-center"
          sx={{
            fontSize: {
              xs: '1.6rem',
              sm: '2rem',
              md: '2.5rem',
              lg: '3rem',
            },
          }}
        >
          HALL OF FAME
        </Typography>
        {/* <Button
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
        </Button> */}
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
              height: '70dvh',
            }}
          >
            <Table>
              <TableHead
                sx={{
                  bgcolor: '#f1dac4',
                  position: 'sticky',

                  top: 0,
                  zIndex: 1,
                }}
              >
                <TableRow>
                  <TableCell
                    align="center"
                    sx={{
                      py: 1,
                      px: 2,
                      borderBottom: '1px solid #474973',
                      color: '#161b33',
                      fontSize: {
                        xs: '.7rem',
                        sm: '.8rem',
                        md: '.9rem',
                        lg: '1rem',
                      },
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
                      color: '#161b33',
                      fontSize: {
                        xs: '.7rem',
                        sm: '.8rem',
                        md: '.9rem',
                        lg: '1rem',
                      },
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
                      color: '#161b33',
                      fontSize: {
                        xs: '.7rem',
                        sm: '.8rem',
                        md: '.9rem',
                        lg: '1rem',
                      },
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
                      color: '#161b33',
                      fontSize: {
                        xs: '.7rem',
                        sm: '.8rem',
                        md: '.9rem',
                        lg: '1rem',
                      },
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
                        textAlign: 'center',
                        fontSize: {
                          xs: '.7rem',
                          sm: '.8rem',
                          md: '.9rem',
                          lg: '1rem',
                        },
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
                        textAlign: 'center',
                        fontSize: {
                          xs: '.7rem',
                          sm: '.8rem',
                          md: '.9rem',
                          lg: '1rem',
                        },
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
                        textAlign: 'center',
                        fontSize: {
                          xs: '.7rem',
                          sm: '.8rem',
                          md: '.9rem',
                          lg: '1rem',
                        },
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
                        textAlign: 'center',
                        fontSize: {
                          xs: '.7rem',
                          sm: '.8rem',
                          md: '.9rem',
                          lg: '1rem',
                        },
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
            className="flex justify-center mt-8 items-center "
            sx={{ color: '#a69cac', width: '70dvw' }}
          >
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
