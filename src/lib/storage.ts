import { Encrypted, decrypt, encrypt } from './encryption'
import { Config } from '../providers/config'
import { useState } from 'react'

export const clearStorage = () => {
  return localStorage.clear()
}

export const saveConfigToStorage = (config: Config): void => {
  localStorage.setItem('config', JSON.stringify(config))
}

export const readConfigFromStorage = (): Config | undefined => {
  const config = localStorage.getItem('config')
  return config ? JSON.parse(config) : undefined
}

export const saveMnemonicToStorage = async (mnemonic: string, password: string): Promise<void> => {
  const encrypted = await encrypt(mnemonic, password)
  localStorage.setItem('mnemonic', JSON.stringify(encrypted))
}

export const readMnemonicFromStorage = async (password: string): Promise<string | undefined> => {
  const encrypted = localStorage.getItem('mnemonic') as string
  return encrypted ? await decrypt(JSON.parse(encrypted) as Encrypted, password) : undefined
}

export const useStorage = <T>(key: string, defaultValue: T): [T, (value: T) => void] => {
  let value = JSON.parse(localStorage.getItem(key) ?? JSON.stringify(defaultValue))

  const setStoredValue = (v: T) => {
    localStorage.setItem(key, JSON.stringify(v))
    value = v
  }

  return [value, setStoredValue]
}