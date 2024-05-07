import classNames from 'classnames'
import { ReactElement } from 'react'

interface ButtonProps {
  disabled?: boolean
  icon?: ReactElement
  label: string
  onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
  secondary?: boolean
}

export default function Button({ disabled, icon, label, onClick, secondary }: ButtonProps) {
  return (
    <button className={
      classNames(
        'px-8 py-3 font-semibold rounded-md w-full disabled:opacity-50 border hover:shadow-sm',
        { 'bg-gray dark:bg-gray-800 text-blue dark:text-gray-100 border-gray-200 dark:border-gray-700': secondary },
        { 'bg-gray-900 text-primary border-gray-200 dark:border-primary': !secondary}
      )
    } disabled={disabled} onClick={onClick} type='button'>
      <div className='flex justify-center items-center'>
        {icon ?? null}
        {label}
      </div>
    </button>
  )
}
