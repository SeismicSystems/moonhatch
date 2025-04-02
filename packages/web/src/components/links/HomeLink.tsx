import { useNavigate } from 'react-router-dom'

import IconLink from '@/components/links/IconLink'
import HomeIcon from '@mui/icons-material/Home'

const HomeLink = ({ style }: { style?: React.CSSProperties }) => {
  const navigate = useNavigate()
  return (
    <IconLink onClick={() => navigate('/')} text="Home" style={style}>
      <HomeIcon
        sx={{
          fontSize: { xs: '20px', sm: '30px', md: '34px' },
        }}
      />
    </IconLink>
  )
}

export default HomeLink
