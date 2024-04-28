import { Wallet } from '../providers/wallet'
import { NetworkName } from './network'
import { BlindedUtxo } from './types'

export enum ExplorerName {
  Blockstream = 'Blockstream',
  Mempool = 'Mempool',
  Nigiri = 'Nigiri',
}

export interface ExplorerURLs {
  restApiExplorerURL: string
  webSocketExplorerURL: string // ws:// or wss:// endpoint
}

export interface Explorer {
  name: ExplorerName
  [NetworkName.Mainnet]?: ExplorerURLs
  [NetworkName.Testnet]?: ExplorerURLs
  [NetworkName.Regtest]?: ExplorerURLs
}

const explorers: Explorer[] = [
  {
    name: ExplorerName.Blockstream,
    [NetworkName.Mainnet]: {
      restApiExplorerURL: 'https://blockstream.info/liquid',
      webSocketExplorerURL: 'wss://esplora.blockstream.com/liquid/electrum-websocket/api',
    },
    [NetworkName.Testnet]: {
      restApiExplorerURL: 'https://blockstream.info/liquidtestnet',
      webSocketExplorerURL: 'wss://esplora.blockstream.com/liquidtestnet/electrum-websocket/api',
    },
  },
  {
    name: ExplorerName.Mempool,
    [NetworkName.Mainnet]: {
      restApiExplorerURL: 'https://liquid.network',
      webSocketExplorerURL: 'wss://esplora.blockstream.com/liquid/electrum-websocket/api',
    },
    [NetworkName.Testnet]: {
      restApiExplorerURL: 'https://liquid.network/liquidtestnet',
      webSocketExplorerURL: 'wss://blockstream.info/liquidtestnet/electrum-websocket/api',
    },
  },
  {
    name: ExplorerName.Nigiri,
    [NetworkName.Regtest]: {
      restApiExplorerURL: 'http://localhost:5001',
      webSocketExplorerURL: 'ws://127.0.0.1:1234',
    },
  },
]

export const getExplorerNames = (network: NetworkName) =>
  explorers.filter((e: Explorer) => e[network]).map((e) => e.name)

const getRestApiExplorerURL = ({ explorer, network }: Wallet) => {
  const exp = explorers.find((e) => e.name === explorer)
  if (exp?.[network]) return exp[network]?.restApiExplorerURL
}

export const getWebSocketExplorerURL = (explorer: ExplorerName, network: NetworkName): string | undefined => {
  const exp = explorers.find((e) => e.name === explorer)
  return exp?.[network]?.webSocketExplorerURL
}

export const getTxIdURL = (txid: string, wallet: Wallet) => {
  // stupid bug from mempool
  const url = getRestApiExplorerURL(wallet)?.replace(
    'https://liquid.network/liquidtestnet',
    'https://liquid.network/testnet',
  )
  return `${url}/tx/${txid}`
}

export const openInNewTab = (txid: string, wallet: Wallet) => {
  window.open(getTxIdURL(txid, wallet), '_blank', 'noreferrer')
}

export interface AddressInfo {
  address: string
  chain_stats: {
    funded_txo_count: number
    spent_txo_count: number
    tx_count: number
  }
  mempool_stats: {
    funded_txo_count: number
    spent_txo_count: number
    tx_count: number
  }
}

export const fetchAddress = async (address: string, wallet: Wallet): Promise<AddressInfo> => {
  const url = `${getRestApiExplorerURL(wallet)}/api/address/${address}`
  const response = await fetch(url)
  return await response.json()
}

export interface AddressTxInfo {
  txid: string
  version: number
  locktime: number
  vin: [any]
  vout: [any]
  size: number
  weight: number
  fee: number
  status: {
    confirmed: boolean
    block_height: number
    block_hash: string
    block_time: number
  }
}

export const fetchAddressTxs = async (address: string, wallet: Wallet): Promise<AddressTxInfo[]> => {
  const explorerURL = getRestApiExplorerURL(wallet)
  const url = `${explorerURL}/api/address/${address}/txs`
  const response = await fetch(url)
  return await response.json()
}

export const fetchAddressUtxos = async (address: string, wallet: Wallet): Promise<BlindedUtxo[]> => {
  const url = `${getRestApiExplorerURL(wallet)}/api/address/${address}/utxo`
  const response = await fetch(url)
  return await response.json()
}

export const fetchTxHex = async (txid: string, wallet: Wallet): Promise<string> => {
  const url = `${getRestApiExplorerURL(wallet)}/api/tx/${txid}/hex`
  const response = await fetch(url)
  return await response.text()
}

export const broadcastTxHex = async (txHex: string, wallet: Wallet): Promise<{ id: string }> => {
  const t = wallet.network === NetworkName.Testnet ? 'testnet.' : ''
  const url = `https://api.${t}boltz.exchange/v2/chain/L-BTC/transaction`
  const response = await fetch(url, {
    body: JSON.stringify({ hex: txHex }),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  })
  return await response.json()
}
