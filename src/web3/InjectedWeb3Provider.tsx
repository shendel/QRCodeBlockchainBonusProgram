import { useState, useEffect, createContext, useContext } from 'react'
import Web3 from 'web3'
import { useAccount } from 'wagmi'

const InjectedWeb3Context = createContext({
  injectedWeb3: false,
  injectedAccount: false
})

export const useInjectedWeb3 = () => {
  return useContext(InjectedWeb3Context)
}

export default function InjectedWeb3Provider(props) {
  const {
    children,
    chainId
  } = props
  
  const [ injectedWeb3, setInjectedWeb3 ] = useState(false)
  const [ injectedAccount, setInjectedAccount ] = useState(false)
  
  const account = useAccount()
  
  const [ activeConnector, setActiveConnector ] = useState(false)
  
  useEffect(() => {
    if (activeConnector) {
      activeConnector.getProvider().then(async (provider) => {
        const web3 = new Web3(provider)
        setInjectedWeb3(web3)
      })
    }
  }, [ activeConnector ])

  useEffect(() => {
    if (account && account.connector) {
      setInjectedAccount(account.address)
      setActiveConnector(account.connector)
    }
  }, [ chainId, account ])

  return (
    <InjectedWeb3Context.Provider value={{injectedWeb3, injectedAccount}}>
      {children}
    </InjectedWeb3Context.Provider>
  )
}