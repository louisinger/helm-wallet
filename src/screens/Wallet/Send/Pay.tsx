import { useContext, useState } from 'react'
import Button from '../../../components/Button'
import ButtonsOnBottom from '../../../components/ButtonsOnBottom'
import { NavigationContext, Pages } from '../../../providers/navigation'
import { FlowContext } from '../../../providers/flow'
import Content from '../../../components/Content'
import Title from '../../../components/Title'
import Container from '../../../components/Container'
import NeedsPassword from '../../../components/NeedsPassword'
import { prettyNumber } from '../../../lib/format'
import { WalletContext } from '../../../providers/wallet'
import { inOneMinute, someSeconds } from '../../../lib/constants'
import { sendSats } from '../../../lib/transactions'
import Error from '../../../components/Error'
import Loading from '../../../components/Loading'

export default function SendPayment() {
  const { navigate } = useContext(NavigationContext)
  const { sendInfo, setSendInfo } = useContext(FlowContext)
  const { reloadWallet, wallet } = useContext(WalletContext)

  const [error, setError] = useState('')

  const { total } = sendInfo

  const onTxid = (txid: string) => {
    if (!txid) return setError('Error broadcasting transaction')
    setSendInfo({ ...sendInfo, txid })
    setTimeout(reloadWallet, someSeconds)
    setTimeout(reloadWallet, inOneMinute)
    navigate(Pages.SendSuccess)
  }

  const goBackToWallet = () => {
    setSendInfo({})
    navigate(Pages.Wallet)
  }

  const onMnemonic = (mnemonic: string) => {
    if (!mnemonic) return

    if (sendInfo.address && sendInfo.total && sendInfo.txFees) {
      sendSats(sendInfo.total, sendInfo.address, sendInfo.txFees, wallet, mnemonic).then((txid) => onTxid(txid))
    }
  }

  return (
    <Container>
      <Content>
        <Title text='Pay' subtext={`Paying ${prettyNumber(total ?? 0)} sats`} />
        {error ? <Error error={Boolean(error)} text={error} /> : <Loading />}
      </Content>
      <ButtonsOnBottom>
        <Button onClick={goBackToWallet} label='Back to wallet' secondary />
      </ButtonsOnBottom>
      <NeedsPassword onClose={goBackToWallet} onMnemonic={onMnemonic} />
    </Container>
  )
}
