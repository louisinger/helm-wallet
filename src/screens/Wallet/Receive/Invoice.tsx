import { useContext, useEffect, useState } from 'react'
import Button from '../../../components/Button'
import Content from '../../../components/Content'
import Title from '../../../components/Title'
import QrCode from '../../../components/QrCode'
import Container from '../../../components/Container'
import ButtonsOnBottom from '../../../components/ButtonsOnBottom'
import Error from '../../../components/Error'
import { FlowContext } from '../../../providers/flow'
import { NavigationContext, Pages } from '../../../providers/navigation'
import { extractError } from '../../../lib/error'
import { WalletContext } from '../../../providers/wallet'
import { copyToClipboard } from '../../../lib/clipboard'
import { inOneMinute, someSeconds } from '../../../lib/constants'
import { NewAddress, generateAddress } from '../../../lib/address'
import { ElectrumHistory } from '../../../lib/chainsource'

export default function ReceiveInvoice() {
  const { recvInfo, setRecvInfo } = useContext(FlowContext)
  const { navigate } = useContext(NavigationContext)
  const { chainSource, increaseIndex, reloadWallet, wallet } = useContext(WalletContext)

  const label = 'Copy to clipboard'
  const [address, setAddress] = useState<NewAddress>()
  const [buttonLabel, setButtonLabel] = useState(label)
  const [error, setError] = useState('')

  const firefox = !navigator.clipboard || !('writeText' in navigator.clipboard)

  const onFinish = (txid: string) => {
    increaseIndex()
    setTimeout(reloadWallet, someSeconds)
    setTimeout(reloadWallet, inOneMinute)
    setRecvInfo({ ...recvInfo, txid })
    navigate(Pages.ReceiveSuccess)
  }

  const handleCancel = () => {
    setRecvInfo({ amount: 0 })
    navigate(Pages.Wallet)
  }

  const handleCopy = async () => {
    await copyToClipboard(qrValue ?? '')
    setButtonLabel('Copied')
    setTimeout(() => setButtonLabel(label), 2000)
  }

  useEffect(() => {
      try {
        generateAddress(wallet).then((addr) => {
          setAddress(addr)
          chainSource.waitForAddressReceivesTx(addr.address).then(() => {
            chainSource.fetchHistories([addr.script]).then((histories: ElectrumHistory[]) => {
              const newTx = histories.find((tx) => tx.height <= 0)
              if (newTx) onFinish(newTx.tx_hash ?? '')
            })
          })
        })
      } catch (error) {
        setError(extractError(error))
      }
  }, [])

  const qrValue = address?.address

  return (
    <Container>
      <Content>
        <Title text='address' subtext='Scan or copy to clipboard' />
        <div className='flex flex-col gap-2'>
          <Error error={Boolean(error)} text={error} />
          <div>
            <QrCode value={qrValue ?? ''} />
          </div>
        </div>
      </Content>
      <ButtonsOnBottom>
        {!firefox && <Button onClick={handleCopy} label={buttonLabel} />}
        <Button onClick={handleCancel} label='Cancel' secondary />
      </ButtonsOnBottom>
    </Container>
  )
}
