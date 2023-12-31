import { useState, useEffect, createContext, useContext } from 'react'
import { GET_CHAIN_RPC } from './chains'
import Web3 from 'web3'
import {
  getEthLikeWallet,
  getRandomMnemonicWords,
  mnemonicIsValid,
  convertMnemonicToValid
} from './mnemonic'

import fetchBalance from '@/helpers/fetchBalance'

import {
  BROWSER_SEED_LS_NAME,
  BROWSER_SEED_LS_BACKUP_READY,
} from '@/config'

const authBrowserWeb3 = (chainId, ownMnemonic = false) => {
  const rpc = GET_CHAIN_RPC(chainId)
  const web3 = new Web3(rpc)
  
  let mnemonic = localStorage.getItem(BROWSER_SEED_LS_NAME || `NEXTGEN_BROWSER_SEED`)
  if (!mnemonic) {
    mnemonic = getRandomMnemonicWords()
    localStorage.setItem(BROWSER_SEED_LS_NAME || `NEXTGEN_BROWSER_SEED`, mnemonic)
  }
  
  const wallet = getEthLikeWallet({ mnemonic })
  const account = web3.eth.accounts.privateKeyToAccount( wallet.privateKey )
  web3.eth.accounts.wallet.add( account.privateKey )
  
  console.log('[BrowserWallet] >>>> ', wallet)
  return {
    web3,
    mnemonic,
    account: wallet.address
  }
}

const BrowserWeb3Context = createContext({
  browserWeb3: false,
  browserAccount: false,
  browserMnemonic: ``,
  browserBackupReady: false,
  balance: 0,
  isBalanceFetched: false,
  isBalanceFetching: true,
  switchAccount: () => {}
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
  const [ browserMnemonic, setBrowserMnemonic ] = useState(``)
  const [ browserBackupReady, setBrowserBackupReady ] = useState(false)
  
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
    const { web3, account, mnemonic } = authBrowserWeb3(chainId)
    setBrowserWeb3(web3)
    setBrowserAccount(account)
    setBrowserMnemonic(mnemonic)
  }, [ chainId ])

  const switchAccount = (newMnemonic) => {
    if (mnemonicIsValid(newMnemonic)) {
      console.log('>>> do switch account', newMnemonic)
      localStorage.setItem(BROWSER_SEED_LS_NAME || `NEXTGEN_BROWSER_SEED`, convertMnemonicToValid(newMnemonic))
      const { web3, account, mnemonic } = authBrowserWeb3(chainId)
      setBrowserWeb3(web3)
      setBrowserAccount(account)
      setBrowserMnemonic(mnemonic)
      return true
    }
    return false
  }

  return (
    <BrowserWeb3Context.Provider
      value={{
        browserWeb3,
        browserMnemonic,
        browserAccount,
        balance,
        isBalanceFetched,
        isBalanceFetching,
        switchAccount,
      }}
    >
      {children}
    </BrowserWeb3Context.Provider>
  )
}