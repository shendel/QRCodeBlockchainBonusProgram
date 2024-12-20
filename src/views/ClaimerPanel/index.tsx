
import { useEffect, useState, Component } from "react"
import { getAssets } from '@/helpers/getAssets'

import styles from './index.module.scss'
import { useBrowserWeb3 } from '@/web3/BrowserWeb3Provider'
import fetchWalletStatus from '@/qrcode_helpers/fetchWalletStatus'

import Avatar from '@/components/qrcode/Avatar'

import {
  WORK_CHAIN_ID,
  MAINNET_CHAIN_ID,
  MAINNET_TOKEN,
  PROJECT_TITLE,
} from '@/config'
import { fromWei } from '@/helpers/wei'

import ScanIcon from './ScanIcon'

export default function ClaimerPanel(props) {
  const {
    gotoPage,
    factoryStatus,
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
    <div className={styles.claimerPanel}>
      <header>{PROJECT_TITLE}</header>
      <div className={styles.scanHolder}>
        <a className={styles.scanButton} onClick={() => { gotoPage('claimer/scanqrcode') }}>
          <ScanIcon />
          <span>ScanQR</span>
        </a>
      </div>
      <div className={styles.accountPanel}>
        <span>You account</span>
        <Avatar />
        <div className={styles.buttons}>
          <a onClick={() => { gotoPage('account/backup') }}>Backup</a>
          <a onClick={() => { gotoPage('account/restore') }}>Restore</a>
        </div>
      </div>
      <div className={styles.tokensPanel}>
        <div className={styles.balancePanels}>
          <div>
            <span>Your tokens</span>
            <div>
              <strong>{fromWei(mainnetBalance, mainnetTokenDecimals)}</strong>
              <em>{mainnetTokenSymbol}</em>
            </div>
          </div>
          <div>
            <span>Bonus points</span>
            <div>
              <strong>{fromWei(balance, factoryStatus.tokenDecimals)}</strong>
              <em>{factoryStatus.tokenSymbol}</em>
            </div>
          </div>
        </div>
        <a className={styles.button} onClick={() => { gotoPage('/bridge') }}>Convert points to tokens</a>
      </div>
    </div>
  )
}
