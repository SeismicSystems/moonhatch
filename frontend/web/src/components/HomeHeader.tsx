import LockIcon from '@mui/icons-material/Lock'
import SchoolIcon from '@mui/icons-material/School'
import KingOfTheHillSection from './home/king-of-the-hill'
import CreateCoinButton from './home/create-coin-button'

interface Coin {
  id: string
  name: string
  wei_in: string
}

interface HomeHeaderProps {
  coins: Coin[]
}
export default function HomeHeader({ coins }: HomeHeaderProps) {
  return (
    <>
      <div className="flex flex-col   items-center w-full px-4">
        <CreateCoinButton/>
        <KingOfTheHillSection coins={coins} />
      </div>
      <div className="justify-self-end  lg:mt-2 flex-col flex text-[var(--creamWhite)]"></div>
      <div className="flex grad-icons-container gap-2 justify-center ">
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
      </div>
    </>
  )
}
