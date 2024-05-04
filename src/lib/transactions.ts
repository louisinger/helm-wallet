import { getBalance } from './wallet'
import { Wallet } from '../providers/wallet'
import { selectCoins } from './coinSelection'
import { buildPsbt } from './psbt'
import { signPsbt } from './signer'
import { finalizeAndBroadcast } from './finalizer'

export async function sendSats(
  sats: number, 
  destinationAddress: string, 
  fees: number,
  wallet: Wallet,
  mnemonic: string
): Promise<string> {
  // check if enough balance
  const utxos = wallet.utxos[wallet.network]
  const balance = getBalance(wallet)
  if (!balance || balance - sats - fees) return ''

  // select coins, build pset, sign it and broadcast it
  const coinSelection = selectCoins(sats + fees, utxos)
  const psbt = await buildPsbt(coinSelection, fees, destinationAddress, wallet, mnemonic)
  const signedPsbt = await signPsbt(psbt, coinSelection.coins, wallet.network, mnemonic)
  const txid = await finalizeAndBroadcast(signedPsbt, wallet)

  return txid
}
