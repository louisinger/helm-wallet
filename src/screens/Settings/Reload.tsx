import { useContext } from 'react'
import Button from '../../components/Button'
import ButtonsOnBottom from '../../components/ButtonsOnBottom'
import Title from '../../components/Title'
import { ConfigContext } from '../../providers/config'
import { WalletContext } from '../../providers/wallet'
import Select from '../../components/Select'
import Content from '../../components/Content'
import LoadingIcon from '../../icons/Loading'
import { gapLimits } from '../../lib/wallet'

export default function Reload() {
  const { config, toggleShowConfig, updateConfig } = useContext(ConfigContext)
  const { reloading, reloadWallet, wallet } = useContext(WalletContext)

  const handleChange = (e: any) => {
    const gap = Number(e.target.value)
    if (gapLimits.includes(gap)) updateConfig({ ...config, gap })
  }

  const handleReload = () => reloadWallet(wallet, config.gap)

  return (
    <div className='flex flex-col h-full justify-between'>
      <Content>
        <Title text='Reload' subtext='Reload your UTXOs' />
        <Select label='Gap limit' onChange={handleChange} value={config.gap}>
          {gapLimits.map((e) => (
            <option key={e}>{e}</option>
          ))}
        </Select>
        {reloading ? (
          <center className='my-10'>
            <LoadingIcon />
            <p className='mt-10'>You can go back to wallet, reloading will keep working on the background</p>
          </center>
        ) : (
          <>
            <p className='mt-10'>Increase value if you're missing some coins</p>
            <p className='mt-4'>Higher values makes reloads take longer and increases data usage</p>
          </>
        )}
      </Content>
      <ButtonsOnBottom>
        <Button onClick={handleReload} label='Reload' disabled={reloading} />
        <Button onClick={toggleShowConfig} label='Back to wallet' secondary />
      </ButtonsOnBottom>
    </div>
  )
}
