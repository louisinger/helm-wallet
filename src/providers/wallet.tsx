import { ReactNode, createContext, useContext, useEffect, useRef, useState } from 'react'
import { readWalletFromStorage, saveWalletToStorage } from '../lib/storage'
import { NavigationContext, Pages } from './navigation'
import { NetworkName } from '../lib/network'
import { Mnemonic, Transaction, XPubs } from '../lib/types'
import { ConfigContext } from './config'
import { getUtxos } from '../lib/utxo'
import { getTransactions } from '../lib/transactions'

export interface Wallet {
  initialized: boolean
  masterBlindingKey?: string
  mnemonic: Mnemonic
  network: NetworkName
  nextIndex: number
  transactions: Transaction[]
  utxos: any[]
  xpubs: XPubs
}

interface WalletContextProps {
  loading: boolean
  reloading: boolean
  reload: (w: Wallet, n?: number) => void
  resetWallet: () => void
  setMnemonic: (m: Mnemonic) => void
  updateWallet: (w: Wallet) => void
  wallet: Wallet
}

const defaultWallet: Wallet = {
  initialized: false,
  mnemonic: '',
  network: NetworkName.Testnet,
  nextIndex: 1,
  transactions: [],
  utxos: [],
  xpubs: {
    [NetworkName.Liquid]: '',
    [NetworkName.Regtest]: '',
    [NetworkName.Testnet]: '',
  },
}

export const WalletContext = createContext<WalletContextProps>({
  loading: true,
  reloading: false,
  reload: () => {},
  resetWallet: () => {},
  setMnemonic: () => {},
  updateWallet: () => {},
  wallet: defaultWallet,
})

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const { config } = useContext(ConfigContext)
  const { navigate } = useContext(NavigationContext)

  const [loading, setLoading] = useState(true)
  const [reloading, setReloading] = useState(false)
  const [wallet, setWallet] = useState<Wallet>(defaultWallet)

  const mnemonic = useRef('')

  const setMnemonic = async (m: Mnemonic) => {
    mnemonic.current = m
    setWallet({ ...wallet, mnemonic: m })
  }

  const reload = async (wallet: Wallet, gap = 5) => {
    if (reloading) return
    setReloading(true)
    const utxos = await getUtxos(config, wallet, gap)
    const transactions = await getTransactions(config, wallet, gap)
    console.log('utxos', utxos)
    console.log('transactions', transactions)
    updateWallet({ ...wallet, transactions, utxos })
    setReloading(false)
  }

  const resetWallet = () => {
    updateWallet(defaultWallet)
    navigate(Pages.Init)
  }

  const updateWallet = (data: Wallet) => {
    setWallet({ ...data, mnemonic: mnemonic.current })
    saveWalletToStorage(data)
  }

  useEffect(() => {
    if (!loading) return
    readWalletFromStorage().then((wallet: Wallet | undefined) => {
      setLoading(false)
      if (!wallet) return navigate(Pages.Init)
      setWallet(wallet)
      navigate(Pages.Wallet)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading])

  return (
    <WalletContext.Provider value={{ loading, reloading, reload, resetWallet, setMnemonic, updateWallet, wallet }}>
      {children}
    </WalletContext.Provider>
  )
}
