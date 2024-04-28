import { Psbt, Transaction, address } from 'bitcoinjs-lib'
import { Wallet } from '../providers/wallet'
import { generateAddress } from './address'
import { Utxo } from './types'
import { CoinsSelected } from './coinSelection'
import { getNetwork } from './network'

export const buildPset = async (coinSelection: CoinsSelected, destinationAddress: string, wallet: Wallet) => {
  const network = getNetwork(wallet.network)
  const { amount, changeAmount, coins } = coinSelection

  const outputs = [
    {
      address: destinationAddress,
      value: amount,
    },
  ]

  if (changeAmount) {
    const changeAddress = await generateAddress(wallet)
    outputs.push({
      address: address.fromOutputScript(changeAddress.script, network),
      value: changeAmount,
    })
  }

  return new Psbt({ network })
    .addInputs(
      coins.map((coin: Utxo) => ({
        hash: coin.txid,
        index: coin.vout,
        sighashType: Transaction.SIGHASH_ALL,
      })),
    )
    .addOutputs(outputs)
}
