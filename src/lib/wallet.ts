import { mnemonicToSeed } from 'bip39'
import BIP32Factory from 'bip32'
import { Mnemonic, Satoshis, Utxo, XPubs } from './types'
import { NetworkName, getNetwork } from './network'
import { ECPairFactory, ECPairInterface } from 'ecpair'
import * as ecc from '@bitcoinerlab/secp256k1'
import { Wallet } from '../providers/wallet'

const bip32 = BIP32Factory(ecc)

const derivationPath = {
  [NetworkName.Mainnet]: "m/84'/1776'/0'",
  [NetworkName.Regtest]: "m/84'/1'/0'",
  [NetworkName.Testnet]: "m/84'/1'/0'",
}

export const gapLimits = [5, 20, 40, 80]

export const getMnemonicKeys = async ({ mnemonic, network }: Wallet): Promise<ECPairInterface> => {
  const seed = await mnemonicToSeed(mnemonic)
  if (!seed) throw new Error('Could not get seed from mnemonic')
  const masterNode = bip32.fromSeed(seed)
  const key = masterNode.derivePath(derivationPath[network].replace('m/', ''))
  return ECPairFactory(ecc).fromPrivateKey(key.privateKey!)
}

export const getCoinKeys = async (coin: Utxo, wallet: Wallet): Promise<ECPairInterface> => {
  const { mnemonic, network } = wallet
  const seed = await mnemonicToSeed(mnemonic)
  if (!seed) throw new Error('Could not get seed from mnemonic')
  const masterNode = bip32.fromSeed(seed)
  const key = masterNode.derivePath(derivationPath[network].replace('m/', '')).derive(0).derive(coin.nextIndex)
  return ECPairFactory(ecc).fromPrivateKey(key.privateKey!)
}

export const generateRandomKeys = (net: NetworkName): ECPairInterface => {
  const network = getNetwork(net)
  return ECPairFactory(ecc).makeRandom({ network })
}

const getXpub = (seed: Buffer, network: NetworkName) => {
  return bip32.fromSeed(seed).derivePath(derivationPath[network]).neutered().toBase58()
}

export const getMasterKeys = async (mnemonic: Mnemonic): Promise<{ xpubs: XPubs }> => {
  const seed = await mnemonicToSeed(mnemonic)
  if (!seed) throw new Error('Could not get seed from mnemonic')
  return {
    xpubs: {
      [NetworkName.Mainnet]: getXpub(seed, NetworkName.Mainnet),
      [NetworkName.Regtest]: getXpub(seed, NetworkName.Regtest),
      [NetworkName.Testnet]: getXpub(seed, NetworkName.Testnet),
    },
  }
}

export const getBalance = (wallet: Wallet): Satoshis => {
  const utxos = wallet.utxos[wallet.network]
  if (!utxos) return 0
  return utxos.reduce((prev, curr) => prev + curr.value, 0)
}

export const getUtxos = (wallet: Wallet): Utxo[] => {
  const utxos = wallet.utxos[wallet.network]
  return utxos ?? []
}
