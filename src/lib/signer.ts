import { Psbt } from 'bitcoinjs-lib'
import { getCoinKeys } from './wallet'
import { Mnemonic, Utxo } from './types'
import { NetworkName } from './network'

export const signPsbt = async (partial: Psbt, coins: Utxo[], network: NetworkName, mnemonic: Mnemonic) => {
  for (const [index] of partial.data.inputs.entries()) {
    const keys = await getCoinKeys(coins[index], network, mnemonic)

    console.log('keys', keys)
    // const sighash = Transaction.SIGHASH_ALL
    // TODO
    throw new Error('Could not sign pset')
  }

  return partial
}
