import { useContext, useState } from 'react'
import Button from '../../../components/Button'
import ButtonsOnBottom from '../../../components/ButtonsOnBottom'
import { NavigationContext, Pages } from '../../../providers/navigation'
import { FlowContext } from '../../../providers/flow'
import Title from '../../../components/Title'
import Content from '../../../components/Content'
import InputAmount from '../../../components/InputAmount'
import Container from '../../../components/Container'
import { prettyNumber } from '../../../lib/format'

enum ButtonLabel {
  Low = 'Amount too low',
  High = 'Amount too high',
  Ok = 'Continue',
}

export default function ReceiveAmount() {
  const { navigate } = useContext(NavigationContext)
  const { setRecvInfo } = useContext(FlowContext)

  const [amount, setAmount] = useState(0)

  const handleCancel = () => {
    setRecvInfo({ amount: 0 })
    navigate(Pages.Wallet)
  }

  const handleProceed = () => {
    setRecvInfo({ amount })
    navigate(Pages.ReceiveFees)
  }

  return (
    <Container>
      <Content>
        <Title text='Receive' />
        <InputAmount label='Amount' onChange={setAmount} />
      </Content>
      <ButtonsOnBottom>
        <Button onClick={handleProceed} label={label} disabled={disabled} />
        <Button onClick={handleCancel} label='Cancel' secondary />
      </ButtonsOnBottom>
    </Container>
  )
}
