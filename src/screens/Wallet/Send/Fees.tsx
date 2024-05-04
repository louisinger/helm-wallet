import { useContext, useEffect, useState } from 'react'
import Button from '../../../components/Button'
import Title from '../../../components/Title'
import ButtonsOnBottom from '../../../components/ButtonsOnBottom'
import { NavigationContext, Pages } from '../../../providers/navigation'
import Content from '../../../components/Content'
import Container from '../../../components/Container'
import { FlowContext } from '../../../providers/flow'
import { prettyNumber } from '../../../lib/format'
import { WalletContext } from '../../../providers/wallet'
import Error from '../../../components/Error'
import Table from '../../../components/Table'
import { getBalance } from '../../../lib/wallet'
import { feesToSendSats } from '../../../lib/fees'

export default function SendFees() {
  const { wallet } = useContext(WalletContext)
  const { navigate } = useContext(NavigationContext)
  const { sendInfo, setSendInfo } = useContext(FlowContext)
  const [error, setError] = useState('')

  const { address, total, txFees, satoshis } = sendInfo
  const totalNeeded = (total ?? 0) + (txFees ?? 0)

  useEffect(() => {
    if (satoshis) {
      if (address) {
        const txFees = feesToSendSats(satoshis, wallet)
        setSendInfo({ ...sendInfo, address, txFees, total: satoshis })
        return
      }
    }
  }, [address])

  useEffect(() => {
    if (sendInfo.total) {
      if (getBalance(wallet) < totalNeeded)
        setError(`Insufficient funds, you just have ${prettyNumber(getBalance(wallet))} sats`)
    }
  }, [sendInfo.total])

  const handleCancel = () => {
    setSendInfo({})
    navigate(Pages.Wallet)
  }

  const handlePay = () => navigate(Pages.SendPayment)

  const label = error ? 'Something went wrong' : 'Pay'
  const prettyTotal = prettyNumber((total ?? 0) + (txFees ?? 0))

  const data = [
    ['Amount', prettyNumber(satoshis)],
    ['Transaction fees', prettyNumber(txFees ?? 0)],
    ['Total', prettyTotal],
  ]

  return (
    <Container>
      <Content>
        <Title text='Payment fees' subtext={`You pay ${prettyTotal} sats`} />
        <div className='flex flex-col gap-2'>
          <Error error={Boolean(error)} text={error} />
          <Table data={data} />
        </div>
      </Content>
      <ButtonsOnBottom>
        <Button onClick={handlePay} label={label} disabled={Boolean(error)} />
        <Button onClick={handleCancel} label='Cancel' secondary />
      </ButtonsOnBottom>
    </Container>
  )
}
