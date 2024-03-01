import { useContext, useState } from 'react'
import Button from '../../components/Button'
import ButtonsOnBottom from '../../components/ButtonsOnBottom'
import Subtitle from '../../components/Subtitle'
import Title from '../../components/Title'
import { ConfigContext } from '../../providers/config'
import Content from '../../components/Content'
import NewPassword from '../../components/NewPassword'
import NeedsPassword from '../../components/NeedsPassword'
import Container from '../../components/Container'
import { saveMnemonic } from '../../lib/storage'

function Password() {
  const { toggleShowConfig } = useContext(ConfigContext)

  const [mnemonic, setMnemonic] = useState('')
  const [password, setPassword] = useState('')

  const handleProceed = () => {
    saveMnemonic(mnemonic, password)
    toggleShowConfig()
  }

  return (
    <Container>
      <Content>
        <Title text='Password' />
        <Subtitle text='Change your password' />
        {mnemonic ? <NewPassword onNewPassword={setPassword} /> : null}
      </Content>
      <ButtonsOnBottom>
        <Button onClick={handleProceed} label='Save new password' disabled={!password} />
        <Button onClick={toggleShowConfig} label='Back to wallet' secondary />
      </ButtonsOnBottom>
      <NeedsPassword onClose={toggleShowConfig} onMnemonic={setMnemonic} />
    </Container>
  )
}

export default Password
