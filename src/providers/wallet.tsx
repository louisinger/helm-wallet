import { ReactNode, createContext, useContext, useEffect, useState } from 'react'
import { readWalletFromStorage, saveMnemonicToStorage, saveWalletToStorage } from '../lib/storage'
import { NavigationContext, Pages } from './navigation'
import { NetworkName } from '../lib/network'
import { Mnemonic, Transactions, Utxos, PublicKeys } from '../lib/types'
import { ExplorerName } from '../lib/explorers'
import { defaultExplorer, defaultNetwork } from '../lib/constants'
import { getSilentPaymentScanPrivateKey, isInitialized } from '../lib/wallet'
import { SilentiumAPI } from '../lib/silentpayment/silentium/api'
import { EsploraChainSource } from '../lib/chainsource'
import { Updater, applyUpdate } from '../lib/updater'

export interface Wallet {
  explorer: ExplorerName
  network: NetworkName
  transactions: Transactions
  utxos: Utxos
  publicKeys: PublicKeys
  walletBirthHeight: number
  scannedBlockHeight: number
  silentiumURL: string
}

const defaultWallet: Wallet = {
  explorer: defaultExplorer,
  network: defaultNetwork,
  silentiumURL: '',
  transactions: {
    [NetworkName.Mainnet]: [],
    [NetworkName.Regtest]: [],
    [NetworkName.Testnet]: [],
  },
  utxos: {
    [NetworkName.Mainnet]: [],
    [NetworkName.Regtest]: [],
    [NetworkName.Testnet]: [],
  },
  publicKeys: {
    [NetworkName.Mainnet]: { p2trPublicKey: '', scanPublicKey: '', spendPublicKey: '' },
    [NetworkName.Regtest]: { p2trPublicKey: '', scanPublicKey: '', spendPublicKey: '' },
    [NetworkName.Testnet]: { p2trPublicKey: '', scanPublicKey: '', spendPublicKey: '' },
  },
  walletBirthHeight: 0,
  scannedBlockHeight: 0,
}

interface WalletContextProps {
  changeExplorer: (e: ExplorerName) => void
  changeSilentiumURL: (url: string) => void
  changeNetwork: (n: NetworkName) => void
  loading: boolean
  reloading: boolean
  reloadWallet: (mnemonic: Mnemonic) => void
  resetWallet: () => void
  initWallet: (publicKeys: PublicKeys) => void
  wallet: Wallet
}

export const WalletContext = createContext<WalletContextProps>({
  changeExplorer: () => {},
  changeSilentiumURL: () => {},
  changeNetwork: () => {},
  loading: true,
  reloading: false,
  reloadWallet: () => {},
  resetWallet: () => {},
  initWallet: () => {},
  wallet: defaultWallet,
})

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const { navigate } = useContext(NavigationContext)

  const [loading, setLoading] = useState(true)
  const [reloading, setReloading] = useState(false)
  const [wallet, setWallet] = useState(defaultWallet)

  const changeExplorer = async (explorer: ExplorerName) => {
    const clone = { ...wallet, explorer }
    updateWallet(clone)
  }

  const changeNetwork = async (networkName: NetworkName) => {
    const clone = { ...wallet, network: networkName }
    updateWallet(clone)
  }

  const changeSilentiumURL = async (url: string) => {
    const clone = { ...wallet, silentiumURL: url }
    updateWallet(clone)
  }

  const reloadWallet = async (mnemonic: string) => {
    if (!mnemonic || reloading) return
    setReloading(true)
    const silentiumAPI = new SilentiumAPI(wallet.silentiumURL)
    const chainTip = await silentiumAPI.getChainTipHeight()
    if (chainTip < wallet.scannedBlockHeight) {
      setReloading(false)
      return
    }

    const explorer = new EsploraChainSource(wallet.explorer)
    const scanPrivKey = await getSilentPaymentScanPrivateKey(mnemonic, wallet.network)
    const spendPubKey = Buffer.from(wallet.publicKeys[wallet.network].spendPublicKey, 'hex')
    const p2trPubKey = Buffer.from(wallet.publicKeys[wallet.network].p2trPublicKey, 'hex')
    const p2trScript = Buffer.concat([Buffer.from([0x51, 0x20]), p2trPubKey.slice(1)])

    const updater = new Updater(
      explorer,
      silentiumAPI,
      scanPrivKey,
      spendPubKey,
      p2trScript,
    )
    
    for (let i = wallet.scannedBlockHeight+1; i <= chainTip; i++) {
      const updateResult = await updater.updateHeight(i, wallet.utxos[wallet.network])
      updateWallet({ ...applyUpdate(wallet, updateResult), scannedBlockHeight: i })
    }

    setReloading(false)
  }

  const resetWallet = () => {
    updateWallet(defaultWallet)
    saveMnemonicToStorage('', 'password')
    navigate(Pages.Init)
  }

  const updateWallet = (data: Wallet) => {
    setWallet({ ...data })
    saveWalletToStorage(data)
  }

  const initWallet = (publicKeys: PublicKeys) => {
    updateWallet({ ...defaultWallet, publicKeys })
  }

  useEffect(() => {
    const getWalletFromStorage = async () => {
      if (!loading) return
      const wallet = readWalletFromStorage() ?? defaultWallet
      updateWallet(wallet)
      setLoading(false)
      navigate(isInitialized(wallet) ? Pages.Wallet : Pages.Init)
    }
    getWalletFromStorage()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading])

  return (
    <WalletContext.Provider
      value={{
        changeExplorer,
        changeSilentiumURL,
        changeNetwork,
        loading,
        reloading,
        reloadWallet,
        resetWallet,
        wallet,
        initWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}
