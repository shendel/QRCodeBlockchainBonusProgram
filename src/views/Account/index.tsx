
import { useEffect, useState, Component } from "react"
import { getAssets } from '@/helpers/getAssets'


import { useBrowserWeb3 } from '@/web3/BrowserWeb3Provider'
import fetchWalletStatus from '@/qrcode_helpers/fetchWalletStatus'

import {
  WORK_CHAIN_ID,
  MAINNET_CHAIN_ID,
  MAINNET_TOKEN,
} from '@/config'
import { fromWei } from '@/helpers/wei'

export default function Account(props) {
  const {
    gotoPage,
    factoryStatus
  } = props
  
  const { browserAccount } = useBrowserWeb3()

  const [ energy, setEnergy ] = useState(0)
  const [ balance, setBalance ] = useState(0)
  const [ isBalanceFetching, setIsBalanceFetching ] = useState(true)

  const [ mainnetEnergy, setMainnetEnergy ] = useState(0)
  const [ mainnetBalance, setMainnetBalance ] = useState(0)
  const [ mainnetTokenSymbol, setMainnetTokenSymbol ] = useState(``)
  const [ mainnetTokenDecimals, setMainnetTokenDecimals ] = useState(0)
  const [ isMainnetBalanceFetching, setIsMainnetBalanceFetching ] = useState(true)

  useEffect(() => {
    if (browserAccount) {
      setIsBalanceFetching(true)
      fetchWalletStatus({
        address: browserAccount,
        chainId: WORK_CHAIN_ID,
        tokenAddress: factoryStatus.tokenAddress,
      }).then(({ energy, balance }) => {
        setBalance(balance)
        setEnergy(energy)
        setIsBalanceFetching(false)
      }).catch((err) => {
        console.log(err)
      })
      setIsMainnetBalanceFetching(true)
      fetchWalletStatus({
        address: browserAccount,
        chainId: MAINNET_CHAIN_ID,
        tokenAddress: MAINNET_TOKEN
      }).then(({ energy, balance, tokenDecimals, tokenSymbol }) => {
        setMainnetEnergy(energy)
        setMainnetBalance(balance)
        setMainnetTokenDecimals(tokenDecimals)
        setMainnetTokenSymbol(tokenSymbol)
      }).catch((err) => {
        console.log(err)
      })
    }
  }, [ browserAccount ])
  return (
    <>
      <h1>Account page</h1>
      <div>
        <div>
          <a href="#/">Goto main page</a>
        </div>
        <div>
          <label>You address:</label>
          <strong>{browserAccount}</strong>
          <a href="#/account/backup">[Backup]</a>
          <a href="#/account/restore">[Restore from seed]</a>
        </div>
        <div>
          <label>Your energy:</label>
          <strong>{fromWei(energy)}</strong>
        </div>
        <div>
          <label>Bonus amount:</label>
          <strong>{fromWei(balance, factoryStatus.tokenDecimals)}</strong>
          <em>{factoryStatus.tokenSymbol}</em>
          <button onClick={() => { gotoPage('/bridge') }}>[Convert bonus to tokens]</button>
        </div>
        <div>
          <label>Token balance:</label>
          <strong>{fromWei(mainnetBalance, mainnetTokenDecimals)}</strong>
          <em>{mainnetTokenSymbol}</em>
        </div>
      </div>
    </>
  )
}
