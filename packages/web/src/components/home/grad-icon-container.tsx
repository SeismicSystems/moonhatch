import LockIcon from '@mui/icons-material/Lock'
import SchoolIcon from '@mui/icons-material/School'

const GraduatedIconsContainer: React.FC = () => {
  return (
    <>
      <div className="flex items-center">
        <LockIcon
          className="lock-icon text-red-500 mx-1"
          sx={{
            fontSize: { xs: '20px', sm: '24px', md: '24px', lg: '30px' },
          }}
        />
        <p className="text-[10px] md:text-[12px] lg:text-[14px] text-[var(--creamWhite)]">
          = not graduated to raydium
        </p>
      </div>
      <div className="flex items-center">
        <SchoolIcon
          className="lock-icon text-green-500 mx-1 "
          sx={{
            fontSize: { xs: '20px', sm: '24px', md: '24px', lg: '30px' },
          }}
        />
        <p className="text-[10px] md:text-[12px] lg:text-[14px] text-[var(--creamWhite)]">
          = graduated to raydium
        </p>
      </div>
    </>
  )
}

export default GraduatedIconsContainer
