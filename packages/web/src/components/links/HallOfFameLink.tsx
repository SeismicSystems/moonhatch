import { useNavigate } from 'react-router-dom'

import IconLink from '@/components/links/IconLink'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'

const HallOfFameLink = ({ style }: { style?: React.CSSProperties }) => {
  const navigate = useNavigate()
  return (
    <IconLink
      onClick={() => navigate('/hall-of-fame')}
      text="HOF"
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
      <EmojiEventsIcon
        sx={{
          fontSize: { xs: '20px', sm: '30px', md: '34px' },
          width: '2.3rem',
        }}
      />
    </IconLink>
  )
}

export default HallOfFameLink
