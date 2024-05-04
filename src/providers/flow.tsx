import { ReactNode, createContext, useState } from 'react'

export interface InitInfo {
  mnemonic: string
}

export type SendInfo = {
  address?: string
  total?: number
  satoshis?: number
  txFees?: number
  txid?: string
}

interface FlowContextProps {
  initInfo: InitInfo
  sendInfo: SendInfo
  setInitInfo: (arg0: InitInfo) => void
  setSendInfo: (arg0: SendInfo) => void
}

export const emptyInitInfo: InitInfo = {
  mnemonic: '',
}

export const FlowContext = createContext<FlowContextProps>({
  initInfo: emptyInitInfo,
  sendInfo: {},
  setInitInfo: () => {},
  setSendInfo: () => {},
})

export const FlowProvider = ({ children }: { children: ReactNode }) => {
  const [initInfo, setInitInfo] = useState(emptyInitInfo)
  const [sendInfo, setSendInfo] = useState({} as SendInfo)

  return (
    <FlowContext.Provider value={{ initInfo, sendInfo, setInitInfo, setSendInfo }}>
      {children}
    </FlowContext.Provider>
  )
}
