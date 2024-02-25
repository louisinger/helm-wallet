import { useContext, useEffect, useState } from 'react'
import { validateMnemonic } from 'bip39'
import Button from '../../components/Button'
import Subtitle from '../../components/Subtitle'
import Title from '../../components/Title'
import ButtonsOnBottom from '../../components/ButtonsOnBottom'
import Columns from '../../components/Columns'
import Word from '../../components/Word'
import { NavigationContext, Pages } from '../../providers/navigation'
import { WalletContext } from '../../providers/wallet'
import Content from '../../components/Content'

enum ButtonLabel {
  Incomplete = 'Incomplete mnemonic',
  Invalid = 'Invalid mnemonic',
  Ok = 'Continue',
}

function InitOld() {
  const { navigate } = useContext(NavigationContext)
  const { wallet, reloadUtxos } = useContext(WalletContext)

  const [label, setLabel] = useState(ButtonLabel.Incomplete)
  const [passphrase, setPassphrase] = useState(['', '', '', '', '', '', '', '', '', '', '', ''])

  useEffect(() => {
    const completed = [...passphrase].filter((a) => a)?.length === 12
    if (!completed) return setLabel(ButtonLabel.Incomplete)
    const valid = validateMnemonic(passphrase.join(' '))
    if (!valid) return setLabel(ButtonLabel.Invalid)
    setLabel(ButtonLabel.Ok)
  }, [passphrase])

  const handleChange = (e: any, i: number) => {
    const { value } = e.target
    if (i === 0 && value.split(/\s+/).length === 12) {
      setPassphrase(value.split(/\s+/))
    } else {
      const clone = [...passphrase]
      clone[i] = value
      setPassphrase(clone)
    }
  }

  const handleCancel = () => navigate(Pages.Init)

  const handleProceed = () => {
    const mnemonic = passphrase.join(' ')
    reloadUtxos({ ...wallet, mnemonic })
    navigate(Pages.InitPassword)
  }

  const disabled = label !== ButtonLabel.Ok

  return (
    <div className='flex flex-col h-full justify-between'>
      <Content>
        <Title text='Restore wallet' />
        <Subtitle text='Insert your secret words' />
        <div className='grow'>
          <Columns>
            {[...passphrase].map((word, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <Word key={i} left={i + 1} onChange={(e: any) => handleChange(e, i)} text={word} />
            ))}
          </Columns>
        </div>
      </Content>
      <ButtonsOnBottom>
        <Button onClick={handleCancel} label='Cancel' secondary />
        <Button onClick={handleProceed} label={label} disabled={disabled} />
      </ButtonsOnBottom>
    </div>
  )
}

export default InitOld
