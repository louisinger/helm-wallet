import { Psbt } from 'bitcoinjs-lib'
import { getCoinKeys } from './wallet'
import { Wallet } from '../providers/wallet'
import { Utxo } from './types'


export const signPset = async (partial: Psbt, coins: Utxo[], wallet: Wallet) => {
  for (const [index] of partial.data.inputs.entries()) {
    const keys = await getCoinKeys(coins[index], wallet)

    console.log('keys', keys)
    // const sighash = Transaction.SIGHASH_ALL
    // TODO
    throw new Error('Could not sign pset')
  }

  return partial
}
