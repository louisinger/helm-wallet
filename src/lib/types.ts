import { NetworkName } from './network'

export type Mnemonic = string
export type Password = string
export type Satoshis = number

export type DecodedAddress = { script: Buffer; }

export type NextIndex = number
export type NextIndexes = Record<NetworkName, NextIndex>

export type Transaction = {
  amount: number
  date: string
  hex?: string
  txid: string
  unixdate: number
}
export type Transactions = Record<NetworkName, Transaction[]>

export type MVUtxo = {
  txid: string
  vout: number
}

export type Utxo = MVUtxo & {
  value: number
  address: string
  nextIndex: number
  pubkey: Buffer
  script: Buffer
  prevout?: {
    value: Buffer
    script: Buffer
  }
}

export type Utxos = Record<NetworkName, Utxo[]>

export type XPub = string
export type XPubs = Record<NetworkName, XPub>
