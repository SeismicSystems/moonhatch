import { Typography } from '@mui/material'

type IconLinkProps = {
  onClick: () => void
  style?: React.CSSProperties
  text: string
}

const IconLink: React.FC<React.PropsWithChildren<IconLinkProps>> = ({
  onClick,
  style,
  text,
  children,
}) => {
  return (
    <div
      className="flex flex-col items-center text-[var(--creamWhite)] hover:text-white transition"
      style={{ cursor: 'pointer', ...style }}
      onClick={onClick}
    >
      {children}
      <Typography
        sx={{
          fontSize: { xs: '0.5rem', sm: '0.6rem', md: '0.7rem' },
        }}
      >
        {text}
      </Typography>
    </div>
  )
}

export default IconLink
