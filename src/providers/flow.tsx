import { ReactNode, createContext, useState } from 'react'
import { ECPairInterface } from 'ecpair'

export interface InitInfo {
  mnemonic: string
}

export interface RecvInfo {
  amount: number
  txid?: string
}

export type SendInfo = {
  address?: string
  keys?: ECPairInterface
  total?: number
  satoshis?: number
  txFees?: number
  txid?: string
}

interface FlowContextProps {
  initInfo: InitInfo
  recvInfo: RecvInfo
  sendInfo: SendInfo
  setInitInfo: (arg0: InitInfo) => void
  setRecvInfo: (arg0: RecvInfo) => void
  setSendInfo: (arg0: SendInfo) => void
}

export const emptyInitInfo: InitInfo = {
  mnemonic: '',
}

export const FlowContext = createContext<FlowContextProps>({
  initInfo: emptyInitInfo,
  recvInfo: { amount: 0 },
  sendInfo: {},
  setInitInfo: () => {},
  setRecvInfo: () => {},
  setSendInfo: () => {},
})

export const FlowProvider = ({ children }: { children: ReactNode }) => {
  const [initInfo, setInitInfo] = useState(emptyInitInfo)
  const [recvInfo, setRecvInfo] = useState({ amount: 0 } as RecvInfo)
  const [sendInfo, setSendInfo] = useState({} as SendInfo)

  return (
    <FlowContext.Provider value={{ initInfo, recvInfo, sendInfo, setInitInfo, setRecvInfo, setSendInfo }}>
      {children}
    </FlowContext.Provider>
  )
}
