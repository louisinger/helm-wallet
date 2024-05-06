import { useContext, useState } from 'react'
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
import NeedsPassword from '../../components/NeedsPassword'

export default function Wallet() {
  const { navigate } = useContext(NavigationContext)
  const { wallet, reloadWallet, reloading } = useContext(WalletContext)
  const [askPassword, setAskPassword] = useState(false)
  const [mnemonic, setMnemonic] = useState<string>()

  const handleScan = () => {
    if (!mnemonic) setAskPassword(true)
    else reloadWallet(mnemonic, wallet)
  }

  const handleMnemonicUnlock = (mnemonic: string) => {
    setMnemonic(mnemonic)
    reloadWallet(mnemonic, wallet)
  }

  return (
    <Container>
      {askPassword ? <NeedsPassword onMnemonic={handleMnemonicUnlock} onClose={() => setAskPassword(false)} /> : null}
      <Content>
        <Balance value={getBalance(wallet)} />
        <TransactionsList short />
      </Content>
      <ButtonsOnBottom>
        <Button label='Scan' onClick={() => handleScan()} disabled={reloading} />
        <Button icon={<ScanIcon />} label='Send' onClick={() => navigate(Pages.SendAmount)} />
        <Button icon={<QRCodeIcon />} label='Receive' onClick={() => navigate(Pages.ReceiveAddress)} />
      </ButtonsOnBottom>
    </Container>
  )
}
