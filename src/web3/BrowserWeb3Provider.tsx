import { useState, useEffect, createContext, useContext } from 'react'
import { GET_CHAIN_RPC } from './chains'
import Web3 from 'web3'
import {
  getEthLikeWallet,
  getRandomMnemonicWords
} from './mnemonic'

import fetchBalance from '@/helpers/fetchBalance'


const authBrowserWeb3 = (chainId, ownMnemonic = false) => {
  const rpc = GET_CHAIN_RPC(chainId)
  const web3 = new Web3(rpc)
  
  let mnemonic = localStorage.getItem(`QRCODE_SEED`)
  if (!mnemonic) {
    mnemonic = getRandomMnemonicWords()
    localStorage.setItem(`QRCODE_SEED`, mnemonic)
  }
  
  const wallet = getEthLikeWallet({ mnemonic })
  const account = web3.eth.accounts.privateKeyToAccount( wallet.privateKey )
  web3.eth.accounts.wallet.add( account.privateKey )
  
  console.log('[BrowserWallet] >>>> ', wallet)
  return {
    web3,
    account: wallet.address
  }
}

const BrowserWeb3Context = createContext({
  browserWeb3: false,
  browserAccount: false,
  balance: 0,
  isBalanceFetched: false,
  isBalanceFetching: true,
})

export const useBrowserWeb3 = () => {
  return useContext(BrowserWeb3Context)
}

export default function BrowserWeb3Provider(props) {
  const {
    children,
    chainId
  } = props
  
  const [ browserWeb3, setBrowserWeb3 ] = useState(false)
  const [ browserAccount, setBrowserAccount ] = useState(false)
  
  const [ balance, setBalance ] = useState(0)
  const [ isBalanceFetched, setIsBalanceFetched ] = useState(false)
  const [ isBalanceFetching, setIsBalanceFetching ] = useState(true)

  /* balance */
  useEffect(() => {
    if (browserAccount && chainId) {
      setIsBalanceFetched(false)
      setIsBalanceFetching(true)
      
      fetchBalance({
        address: browserAccount,
        chainId,
      }).then((balance) => {
        setBalance(balance)
        setIsBalanceFetched(true)
        setIsBalanceFetching(false)
      }).catch((err) => {
        setIsBalanceFetched(false)
        setIsBalanceFetching(false)
        console.log('>> InjectedWeb3Provider', err)
      })
    }
  }, [ browserAccount, chainId ])
  /* ---- */

  useEffect(() => {
    const { web3, account } = authBrowserWeb3(chainId)
    setBrowserWeb3(web3)
    setBrowserAccount(account)
  }, [ chainId ])

  return (
    <BrowserWeb3Context.Provider
      value={{
        browserWeb3,
        browserAccount,
        balance,
        isBalanceFetched,
        isBalanceFetching,
      }}
    >
      {children}
    </BrowserWeb3Context.Provider>
  )
}