import { useState } from 'react'
import EyeOpenIcon from '../icons/EyeOpen'
import EyeClosedIcon from '../icons/EyeClosed'
import Label from './Label'

interface InputPasswordProps {
  label: string
  onChange: (arg0: any) => void
}

function InputPassword({ label, onChange }: InputPasswordProps) {
  const [type, setType] = useState('password')

  const toggleVisibility = () => setType(type === 'text' ? 'password' : 'text')

  return (
    <form>
      {label ? <Label text={label} /> : null}
      <div className='flex items-center h-12 rounded-l-md bg-gray-100'>
        <input
          autoComplete='new-password'
          className='w-full p-3 text-sm font-semibold rounded-l-md bg-gray-100'
          onChange={onChange}
          type={type}
        />
        <div
          className='w-16 h-full flex items-center rounded-r-md text-sm bg-gray-700 text-gray-100'
          onClick={toggleVisibility}
        >
          <div className='mx-auto'>{type === 'password' ? <EyeOpenIcon /> : <EyeClosedIcon />}</div>
        </div>
      </div>
    </form>
  )
}

export default InputPassword
