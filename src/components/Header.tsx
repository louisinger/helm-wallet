import { useContext } from 'react'
import LogoIcon from '../icons/Logo'
import SettingsIcon from '../icons/Settings'
import { ConfigContext } from '../providers/config'
import { NavigationContext, Pages } from '../providers/navigation'
import { WalletContext } from '../providers/wallet'
import { NetworkName } from '../lib/network'

const Testnet = () => (
  <div className='flex items-center'>
    <p className='bg-gray-100 dark:bg-gray-800 border border-gray-100 dark:border-gray-800 px-1 rounded-md uppercase text-xxs font-semibold'>
      Testnet
    </p>
  </div>
)

export default function Header() {
  const { toggleShowConfig } = useContext(ConfigContext)
  const { navigate } = useContext(NavigationContext)
  const { reloading, wallet } = useContext(WalletContext)

  const handleClick = () => navigate(wallet.initialized ? Pages.Wallet : Pages.Init)

  return (
    <header className='flex justify-between w-full mb-3 sm:mb-10'>
      <button
        onClick={handleClick}
        aria-label='Back to homepage'
        className={(reloading ? 'animate-pulse ' : '') + 'p-2 rounded-full bg-gray-100 dark:bg-gray-800'}
      >
        <LogoIcon />
      </button>
      {wallet.network === NetworkName.Testnet ? <Testnet /> : null}
      <button onClick={toggleShowConfig} className='p-2 rounded-full bg-gray-100 dark:bg-gray-800'>
        <SettingsIcon />
      </button>
    </header>
  )
}
