import { useContext, useState } from 'react'
import Button from '../../components/Button'
import ButtonsOnBottom from '../../components/ButtonsOnBottom'
import Title from '../../components/Title'
import { NavigationContext, Pages } from '../../providers/navigation'
import { getKeys } from '../../lib/wallet'
import { WalletContext } from '../../providers/wallet'
import Content from '../../components/Content'
import NewPassword from '../../components/NewPassword'
import { saveMnemonicToStorage } from '../../lib/storage'
import { FlowContext } from '../../providers/flow'
import Container from '../../components/Container'

export default function InitPassword() {
  const { navigate } = useContext(NavigationContext)
  const { reloadWallet, initWallet } = useContext(WalletContext)
  const { initInfo } = useContext(FlowContext)

  const [label, setLabel] = useState('')
  const [password, setPassword] = useState('')

  const handleCancel = () => navigate(Pages.Init)

  const handleProceed = () => {
    const { mnemonic } = initInfo
    saveMnemonicToStorage(mnemonic, password)
    getKeys(mnemonic).then(({ publicKeys }) => {
      initWallet(publicKeys)
      reloadWallet(mnemonic)
      navigate(Pages.Wallet)
    })
  }

  return (
    <Container>
      <Content>
        <Title text='Password' subtext='Define your password' />
        <NewPassword onNewPassword={setPassword} setLabel={setLabel} />
      </Content>
      <ButtonsOnBottom>
        <Button onClick={handleProceed} label={label} disabled={!password} />
        <Button onClick={handleCancel} label='Cancel' secondary />
      </ButtonsOnBottom>
    </Container>
  )
}
