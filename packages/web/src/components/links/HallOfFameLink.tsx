import { useNavigate } from 'react-router-dom'

import IconLink from '@/components/links/IconLink'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'

const HallOfFameLink = ({ style }: { style?: React.CSSProperties }) => {
  const navigate = useNavigate()
  return (
    <IconLink
      onClick={() => navigate('/hall-of-fame')}
      text="Hall of Fame"
      style={style}
    >
      <EmojiEventsIcon
        sx={{
          fontSize: { xs: '20px', sm: '30px', md: '34px' },
        }}
      />
    </IconLink>
  )
}

export default HallOfFameLink
