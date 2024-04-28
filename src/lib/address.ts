import * as ecc from '@bitcoinerlab/secp256k1'
import { payments } from 'bitcoinjs-lib'
import BIP32Factory from 'bip32'
import { getNetwork } from './network'
import { Wallet } from '../providers/wallet'

const bip32 = BIP32Factory(ecc)

export interface NewAddress {
  address: string
  nextIndex: number
  pubkey: Buffer
  script: Buffer
}

export const generateAddress = async (wallet: Wallet, index?: number): Promise<NewAddress> => {
  const chain = 0
  const xpub = wallet.xpubs[wallet.network]
  const network = getNetwork(wallet.network)
  const nextIndex = index ?? wallet.nextIndex[wallet.network]
  const pubkey = bip32.fromBase58(xpub).derive(chain).derive(nextIndex).publicKey
  const { address, output: script } = payments.p2wpkh({ network, pubkey })
  if (!address) throw new Error('Could not generate address')
  if (!script) throw new Error('Could not generate script')
  return { address, nextIndex, pubkey, script }
}
