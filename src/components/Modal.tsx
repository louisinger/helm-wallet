import classNames from 'classnames'
import { ReactNode } from 'react'

interface ModalProps {
  open: boolean
  onClose: (arg0: any) => void
  children: ReactNode
}

export default function Modal({ open, onClose, children }: ModalProps) {
  const backdropClass = classNames(
    'fixed z-80 inset-0 flex justify-center items-center bg-darkgray bg-opacity-60 transition duration-500 ease-in-out', 
    { 'visible': open },
    { 'invisible': !open }
  )   
  const modalClass = classNames(
    'bg-gray dark:bg-darkgray dark:border dark:border-primary',
    'bg-white rounded-xl shadow p-6 transition duration-500 ease-in-out', 
    { 'translate-y-10 delay-25 opacity-100': open },
    { '-translate-y-0-10 opacity-0': !open },
  )
  
  return (
    <div onClick={onClose} className={backdropClass}>
      <div onClick={(e) => e.stopPropagation()} className={modalClass}>
        {children}
      </div>
    </div>
  )
}
