import CreateCoinButton from '@/components/home/create-coin-button'
import GraduatedIconsContainer from '@/components/home/grad-icon-container'
import KingOfTheHillSection from '@/components/home/king-of-the-hill'
import type { Coin } from '@/types/coin'

type HomeHeaderProps = {
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
