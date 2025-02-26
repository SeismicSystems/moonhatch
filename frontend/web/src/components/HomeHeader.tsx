import CreateCoinButton from './home/create-coin-button'
import GraduatedIconsContainer from './home/grad-icon-container'
import KingOfTheHillSection from './home/king-of-the-hill'

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
        <CreateCoinButton />
        <KingOfTheHillSection coins={coins} />
      </div>
      <div className="justify-self-end  lg:mt-2 flex-col flex text-[var(--creamWhite)]"></div>
      <div className="flex grad-icons-container gap-2 justify-center ">
        <GraduatedIconsContainer />
      </div>
    </>
  )
}
