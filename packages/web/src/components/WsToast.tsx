import { toast } from 'react-toastify'

import { Coin } from '@/types/coin'
import { Button } from '@mui/material'
import { Box } from '@mui/material'
import { Typography } from '@mui/material'

type WsToastProps = {
  coin: Coin
  beforeSymbol?: string
  afterSymbol?: string
  onClick: () => void
}

export const WsToast: React.FC<WsToastProps> = ({
  coin,
  beforeSymbol,
  afterSymbol,
  onClick,
}) => {
  return (
    <Box
      component="span"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
      }}
    >
      <Box
        component="span"
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
        }}
      >
        {beforeSymbol && (
          <Typography component="span" variant="body1">
            {beforeSymbol}
          </Typography>
        )}
        <Button
          onClick={onClick}
          sx={{
            minWidth: 'auto',
            padding: '0 4px',
            textTransform: 'none',
            fontWeight: 'normal',
            color: 'blue',
            textDecoration: 'underline',
          }}
          disableRipple
          disableFocusRipple
          disableTouchRipple
        >
          {coin.symbol}
        </Button>
      </Box>
      {afterSymbol && (
        <Typography component="span" variant="body1">
          {afterSymbol}
        </Typography>
      )}
    </Box>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const sendWsToast = (props: WsToastProps) => {
  toast.info(<WsToast {...props} />)
}
