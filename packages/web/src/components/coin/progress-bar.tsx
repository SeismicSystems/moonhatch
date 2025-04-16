import React from 'react'
import { formatEther } from 'viem'

import { Coin } from '@/types/coin'
import { Box, Tooltip, Typography } from '@mui/material'

type GraduationProgressProps = {
  coin: Coin
}

export const GraduationProgress: React.FC<GraduationProgressProps> = ({
  coin,
}) => {
  // In the contract, 1 ETH (1e18 wei) is needed to graduate
  const WEI_GRADUATION = 1000000000000000000n

  // Parse the weiIn value from string to bigint
  const weiIn = BigInt(coin.weiIn || '0')

  // Calculate percentage (capped at 100%)
  const percentage = Math.min(Number((weiIn * 100n) / WEI_GRADUATION), 100)

  // Format values for display
  const formattedWeiIn = formatEther(weiIn)
  const formattedTarget = formatEther(WEI_GRADUATION)

  return (
    <Box sx={{ width: '100%', mt: 1, mb: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="caption" sx={{ color: 'var(--creamWhite)' }}>
          GRADUATION PROGRESS
        </Typography>
        <Typography variant="caption" sx={{ color: 'var(--creamWhite)' }}>
          {formattedWeiIn} / {formattedTarget} ETH
        </Typography>
      </Box>

      <Tooltip title={`${percentage}% to graduation`}>
        <Box
          sx={{
            width: '100%',
            height: '8px',
            bgcolor: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '4px',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              width: `${percentage}%`,
              height: '100%',
              bgcolor: percentage >= 100 ? 'var(--green)' : 'var(--lightBlue)',
              transition: 'width 0.5s ease-in-out',
            }}
          />
        </Box>
      </Tooltip>
    </Box>
  )
}

export default GraduationProgress
