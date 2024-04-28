import { Psbt } from 'bitcoinjs-lib'
import { Wallet } from '../providers/wallet'
import { broadcastTxHex } from './explorers'

export const finalizeAndBroadcast = async (partial: Psbt, wallet: Wallet) => {
  const txHex = partial.finalizeAllInputs().extractTransaction().toHex()
  console.log('txHex', txHex)
  const { id } = await broadcastTxHex(txHex, wallet)
  console.log('txid', id)
  return id
}
