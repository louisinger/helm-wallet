import { useContext } from 'react'
import Balance from '../../components/Balance'
import Button from '../../components/Button'
import ButtonsOnBottom from '../../components/ButtonsOnBottom'
import { NavigationContext, Pages } from '../../providers/navigation'
import { WalletContext } from '../../providers/wallet'
import { getBalance } from '../../lib/wallet'
import Container from '../../components/Container'
import Content from '../../components/Content'
import QRCodeIcon from '../../icons/QRCode'
import ScanIcon from '../../icons/Scan'
import TransactionsList from '../../components/TransactionsList'

export default function Wallet() {
  const { navigate } = useContext(NavigationContext)
  const { wallet } = useContext(WalletContext)

  return (
    <Container>
      <Content>
        <Balance value={getBalance(wallet)} />
        <TransactionsList short />
      </Content>
      <ButtonsOnBottom>
        <Button icon={<ScanIcon />} label='Send' onClick={() => navigate(Pages.SendAmount)} />
        <Button icon={<QRCodeIcon />} label='Receive' onClick={() => navigate(Pages.ReceiveAddress)} />
      </ButtonsOnBottom>
    </Container>
  )
}
