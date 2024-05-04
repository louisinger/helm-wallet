import { BasicFilter } from 'bip158'
import { ChainSource } from './chainsource'
import { SilentiumAPI } from './silentpayment/silentium/api'
import { Transaction, Utxo } from './types'
import { scan, computeScript, computeTweak } from '../lib/silentpayment/scanning'
import { Wallet } from '../providers/wallet'

type UpdateResult = {
  spentUtxos: { txid: string; vout: number }[]
  newUtxos: Utxo[]
  transactions: Transaction[]
}

export class Updater {
  constructor(
    private chainSource: ChainSource,
    private silentiumAPI: SilentiumAPI,
    private scanPrivateKey: Buffer,
    private spendPublicKey: Buffer,
    private p2trScript: Buffer,
  ) {}

  async updateHeight(height: number, currentUtxos: Utxo[]): Promise<UpdateResult> {
    const blockHash = await this.chainSource.getBlockHash(height)
    const blockTimestamp = await this.chainSource.getBlockTime(blockHash)
    const blockScalars = await this.silentiumAPI.getBlockScalars(height)
    const blockFilter = await this.silentiumAPI.getBlockFilter(height)

    const basicFilter = new BasicFilter(blockHash, blockFilter)

    const scriptsInBlock = scan(this.scanPrivateKey, this.spendPublicKey, blockScalars.scalars.map(h2b), basicFilter)

    const silentPayUtxosScripts = currentUtxos
      .filter((utxo) => utxo.silentPayment !== undefined)
      .map((utxo) => utxo.script)

    const silentPaySpentInBlock = basicFilter.filter(silentPayUtxosScripts).map(b2h)
    const p2trInBlock = basicFilter.match(this.p2trScript)

    if (!p2trInBlock && silentPaySpentInBlock.length === 0 && scriptsInBlock.size === 0) {
      return {
        spentUtxos: [],
        newUtxos: [],
        transactions: [],
      }
    }

    const block = await this.chainSource.getBlock(blockHash)
    if (!block.transactions || block.transactions.length === 0) {
      throw new Error('Block has no transactions')
    }

    const spentScriptsToFind = new Set(silentPaySpentInBlock)
    const fundedScriptsToFind = new Set(scriptsInBlock.keys())

    const result: UpdateResult = {
      spentUtxos: [],
      newUtxos: [],
      transactions: [],
    }

    for (const tx of block.transactions) {
      if (spentScriptsToFind.size === 0 && fundedScriptsToFind.size === 0 && !p2trInBlock) {
        break
      }

      const txInfo: Transaction = {
        amount: 0,
        txid: tx.getId(),
        unixdate: blockTimestamp,
      }
      let isWalletTx = false

      for (const input of tx.ins) {
        if (spentScriptsToFind.size === 0 && !p2trInBlock) {
          break
        }

        if (p2trInBlock && input.script.equals(this.p2trScript)) {
          result.spentUtxos.push({
            txid: Buffer.from(input.hash).reverse().toString('hex'),
            vout: input.index,
          })
          txInfo.amount -= currentUtxos.find(
            (utxo) => utxo.txid === Buffer.from(input.hash).reverse().toString('hex') && utxo.vout === input.index,
          )!.value
          isWalletTx = true
          continue
        }

        const script = b2h(input.script)

        if (spentScriptsToFind.has(script)) {
          result.spentUtxos.push({
            txid: Buffer.from(input.hash).reverse().toString('hex'),
            vout: input.index,
          })
          txInfo.amount -= currentUtxos.find(
            (utxo) => utxo.txid === Buffer.from(input.hash).reverse().toString('hex') && utxo.vout === input.index,
          )!.value
          isWalletTx = true
          spentScriptsToFind.delete(script)
        }
      }

      for (const [vout, output] of tx.outs.entries()) {
        if (fundedScriptsToFind.size === 0 && !p2trInBlock) {
          break
        }

        if (p2trInBlock && output.script.equals(this.p2trScript)) {
          result.newUtxos.push({
            txid: tx.getId(),
            vout,
            script: output.script,
            value: output.value,
          })
          txInfo.amount += output.value
          isWalletTx = true
          continue
        }

        const script = b2h(output.script)

        if (fundedScriptsToFind.has(script)) {
          const scalar = scriptsInBlock.get(script)!

          result.newUtxos.push({
            txid: tx.getId(),
            vout,
            script: output.script,
            value: output.value,
            silentPayment: {
              tweak: computeTweak(this.scanPrivateKey, scalar, 0),
            },
          })
          txInfo.amount += output.value
          isWalletTx = true
          fundedScriptsToFind.delete(script)

          let nextCounter = 1
          let nextScript = computeScript(this.scanPrivateKey, this.spendPublicKey, nextCounter, scalar)

          for (let i = vout + 1; i < tx.outs.length; i++) {
            if (tx.outs[i].script.equals(nextScript)) {
              result.newUtxos.push({
                txid: tx.getId(),
                vout: i,
                script: tx.outs[i].script,
                value: tx.outs[i].value,
                silentPayment: {
                  tweak: computeTweak(this.scanPrivateKey, scalar, nextCounter),
                },
              })
              isWalletTx = true
              txInfo.amount += tx.outs[i].value

              nextCounter++
              nextScript = computeScript(this.scanPrivateKey, this.spendPublicKey, nextCounter, scalar)
            }
          }
        }
      }

      if (isWalletTx) {
        result.transactions.push(txInfo)
      }
    }

    return result
  }
}

export function applyUpdate(wallet: Wallet, update: UpdateResult): Wallet {
  let newUtxoState = wallet.utxos[wallet.network]

  for (const spent of update.spentUtxos) {
    newUtxoState = newUtxoState.filter((utxo) => utxo.txid !== spent.txid || utxo.vout !== spent.vout)
  }

  newUtxoState.push(...update.newUtxos)

  
  let newTxs = wallet.transactions[wallet.network]
  newTxs.push(...update.transactions)

  return {
    ...wallet,
    utxos: {
      ...wallet.utxos,
      [wallet.network]: newUtxoState,
    },
    transactions: {
      ...wallet.transactions,
      [wallet.network]: newTxs,
    },
  }
}

function b2h(b: Buffer): string {
  return b.toString('hex')
}

function h2b(h: string): Buffer {
  return Buffer.from(h, 'hex')
}
