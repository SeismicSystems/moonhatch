import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { BASE_API_URL } from '@/api'
import NavBar from '@/components/NavBar'
import HOFInfo from '@/components/hall-of-fame/HOFInfo'
import type { Coin } from '@/types/coin'
import HelpIcon from '@mui/icons-material/Help'
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

interface HallOfFameItem {
  coin: Coin
  price: string
}

interface ProcessedCoin {
  symbol: string
  name: string
  price: number
  marketcap: number
  imageUrl?: string
  id: number
}

export default function HallOfFame() {
  const navigate = useNavigate()
  const [data, setData] = useState<ProcessedCoin[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const itemsPerPage = 20
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showHOFInfo, setShowHOFInfo] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    setError(null)

    try {
      const apiUrl = `${BASE_API_URL}/hall-of-fame`
      console.log('Fetching from:', apiUrl)
      const response = await fetch(apiUrl)

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`)
      }

      const responseData: HallOfFameItem[] = await response.json()

      const processedData: ProcessedCoin[] = responseData.map((item) => {
        const price = parseFloat(item.price)

        let supplyValue: number
        if (typeof item.coin.supply === 'string') {
          supplyValue = parseFloat(item.coin.supply)
        } else {
          supplyValue = Number(item.coin.supply.toString())
        }

        const decimals =
          typeof item.coin.decimals === 'bigint'
            ? Number(item.coin.decimals)
            : item.coin.decimals

        const supplyInTokens = supplyValue / Math.pow(10, decimals)
        const marketcap = price * supplyInTokens

        return {
          id: item.coin.id,
          symbol: item.coin.symbol.trim(),
          name: item.coin.name.trim(),
          price,
          marketcap,
          imageUrl: item.coin.imageUrl,
        }
      })

      processedData.sort((a, b) => b.marketcap - a.marketcap)

      setData(processedData)
      setTotalPages(Math.ceil(processedData.length / itemsPerPage))
    } catch (err) {
      console.error('Error fetching data:', err)
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    const interval = setInterval(
      () => {
        fetchData()
      },
      5 * 60 * 1000
    )

    return () => clearInterval(interval)
  }, [])

  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return data.slice(startIndex, endIndex)
  }

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    page: number
  ) => {
    setCurrentPage(page)
  }

  const formatNumber = (num: number) => {
    if (isNaN(num)) return 'N/A'

    return num.toLocaleString(undefined, {
      maximumFractionDigits: num < 1 ? 6 : 2,
    })
  }

  const handleRowClick = (id: number) => {
    navigate(`/coins/${id}`)
  }

  return (
    <Box className="hof-page-container flex flex-col items-center">
      <NavBar />
      <Box
        className="flex justify-center items-center mb-6 relative"
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
              xs: '1.3rem',
              sm: '2rem',
              md: '2.5rem',
              lg: '3rem',
            },
          }}
        >
          HALL OF FAME
        </Typography>

        <button
          onClick={() => setShowHOFInfo(true)}
          className="absolute right-0 text-orange-300 hover:text-blue-600 transition"
        >
          <HelpIcon
            sx={{
              fontSize: { xs: '1rem', sm: '2rem', md: '2.5rem' },
            }}
          />
        </button>
      </Box>

      {loading && data.length === 0 ? (
        <Box className="text-center py-10 text-[#f1dac4]">
          <CircularProgress sx={{ color: '#f1dac4' }} />
        </Box>
      ) : error ? (
        <Box className="text-center py-10 text-[#f1dac4]">
          <Typography color="error">Error: {error}</Typography>
          <Button
            onClick={fetchData}
            sx={{
              mt: 2,
              color: '#f1dac4',
              borderColor: '#f1dac4',
              '&:hover': {
                borderColor: '#f1dac4',
                backgroundColor: 'rgba(241, 218, 196, 0.1)',
              },
            }}
            variant="outlined"
          >
            Retry
          </Button>
        </Box>
      ) : (
        <>
          {loading && (
            <Box sx={{ position: 'fixed', top: '1rem', right: '1rem' }}>
              <CircularProgress size={24} sx={{ color: '#f1dac4' }} />
            </Box>
          )}
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
                      width: '20%',
                    }}
                  >
                    COIN
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
                      width: '30%',
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
                      width: '25%',
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
                      width: '25%',
                    }}
                  >
                    MARKETCAP
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.length > 0 ? (
                  getCurrentPageData().map((item, index) => (
                    <TableRow
                      key={item.id}
                      sx={{
                        bgcolor: index % 2 === 0 ? '#0d0c1d' : '#161b33',
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: '#2d2957',
                          transition: 'background-color 0.2s ease',
                        },
                      }}
                      onClick={() => handleRowClick(item.id)}
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
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {item.imageUrl && (
                            <Box
                              component="img"
                              src={item.imageUrl}
                              alt={item.symbol}
                              sx={{
                                width: 24,
                                height: 24,
                                borderRadius: '50%',
                                marginRight: 1,
                                objectFit: 'cover',
                              }}
                            />
                          )}
                          {item.symbol}
                        </Box>
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
                        ${formatNumber(item.price)}
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
                        ${formatNumber(item.marketcap)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      sx={{
                        textAlign: 'center',
                        color: '#f1dac4',
                        py: 4,
                      }}
                    >
                      No data available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {data.length > 0 && (
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
          )}
        </>
      )}

      {showHOFInfo && (
        <HOFInfo isOpen={showHOFInfo} onClose={() => setShowHOFInfo(false)} />
      )}
    </Box>
  )
}
