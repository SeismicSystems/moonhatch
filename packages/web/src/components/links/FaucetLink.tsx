import IconLink from '@/components/links/IconLink'
import WaterDropIcon from '@mui/icons-material/WaterDrop'

const FAUCET_URL = import.meta.env.VITE_FAUCET_URL

const FaucetLink = ({ style }: { style?: React.CSSProperties }) => {
  return (
    <IconLink
      onClick={() => {
        window.open(FAUCET_URL, '_blank')
      }}
      text="Faucet"
      style={style}
    >
      <WaterDropIcon
        sx={{ fontSize: { xs: '20px', sm: '30px', md: '34px' } }}
      />
    </IconLink>
  )
}

export default FaucetLink
