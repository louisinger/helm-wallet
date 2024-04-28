import { Wallet } from '../providers/wallet'
import { generateAddress } from './address'
import { AddressTxInfo, fetchAddress, fetchAddressTxs, fetchAddressUtxos, fetchTxHex } from './explorers'
import { prettyUnixTimestamp } from './format'
import { Transaction, Utxo } from './types'
import { defaultGapLimit } from './constants'
import { Transaction as BtcTransaction, address as btcaddress } from 'bitcoinjs-lib'

export const fetchURL = async (url: string): Promise<any> => {
  const res = await fetch(url)
  if (!res.ok) {
    const errorMessage = await res.text()
    throw new Error(`${res.statusText}: ${errorMessage}`)
  }
  return (await res.json()) as any
}

// This functions are for the REST API
//
// After the migration to websocket, these functionalities
// are taken care of by the functions at lib/restore

export interface HistoryResponse {
  nextIndex: number
  transactions: Transaction[]
  utxos: Utxo[]
}

const getTransactionAmount = async (address: string, txInfo: AddressTxInfo, wallet: Wallet): Promise<number> => {
  const utxo = wallet.utxos[wallet.network].find((u) => u.address === address && u.txid === txInfo.txid)
  if (utxo) return utxo.value
  for (const vin of txInfo.vin) {
    if (vin.prevout.scriptpubkey_address === address) {
      const txHex = await fetchTxHex(vin.txid, wallet)
      const tx = BtcTransaction.fromHex(txHex)
      const value = tx.outs[vin.vout].value
      return -Number(value)
    }
  }

  const txHex = await fetchTxHex(txInfo.txid, wallet)
  const tx = BtcTransaction.fromHex(txHex)
  for (let i = 0; txInfo.vout[i]; i++) {
    const vout = txInfo.vout[i]
    if (vout.scriptpubkey_address === address) {
      const value = tx.outs[i].value
      return Number(value)
    }
  }
  return 0
}

export const fetchHistory = async (wallet: Wallet): Promise<HistoryResponse> => {
  const txids: Record<string, Transaction[]> = {}
  const transactions: Transaction[] = []
  let utxos: Utxo[] = []
  let index = 0
  let lastIndexWithTx = 0
  let gap = wallet.gapLimit

  while (gap > 0) {
    const { address, nextIndex, pubkey } = await generateAddress(wallet, index)
    const data = await fetchAddress(address, wallet)
    if (data?.chain_stats?.tx_count > 0 || data?.mempool_stats?.tx_count > 0) {
      gap = defaultGapLimit // resets gap
      lastIndexWithTx = index
      for (const txInfo of await fetchAddressTxs(address, wallet)) {
        if (!txids[txInfo.txid]) txids[txInfo.txid] = []
        txids[txInfo.txid].push({
          amount: await getTransactionAmount(address, txInfo, wallet),
          date: prettyUnixTimestamp(txInfo.status.block_time),
          unixdate: txInfo.status.block_time,
          txid: txInfo.txid,
        })
      }
      for (const utxo of await fetchAddressUtxos(address, wallet)) {
        const txHex = await fetchTxHex(utxo.txid, wallet)
        const tx = BtcTransaction.fromHex(txHex)
        const value = tx.outs[utxo.vout].value
        const script = btcaddress.toOutputScript(address)
        utxos.push({
          ...utxo,
          address,
          nextIndex,
          pubkey,
          script,
          value,
        })
      }
    }
    index += 1
    gap -= 1
  }

  // aggregate transactions by txid
  for (const id of Object.keys(txids)) {
    const first = txids[id][0]
    const amount = txids[id].length === 1 ? first.amount : txids[id].reduce((prev, curr) => curr.amount + prev, 0)
    transactions.push({ ...first, amount })
  }

  return { nextIndex: lastIndexWithTx + 1, transactions, utxos }
}
