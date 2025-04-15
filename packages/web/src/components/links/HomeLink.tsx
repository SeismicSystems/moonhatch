import { useNavigate } from 'react-router-dom'

import IconLink from '@/components/links/IconLink'
import HomeIcon from '@mui/icons-material/Home'

const HomeLink = ({ style }: { style?: React.CSSProperties }) => {
  const navigate = useNavigate()
  return (
    <IconLink
      onClick={() => navigate('/')}
      text="Home"
      style={{
        ...style,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        zIndex: 1,
      }}
    >
      <HomeIcon
        sx={{
          fontSize: { xs: '20px', sm: '30px', md: '34px' },
          width: '100%',
        }}
      />
    </IconLink>
  )
}

export default HomeLink
