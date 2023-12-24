
import { useEffect, useState, Component } from "react"
import { getAssets } from '@/helpers/getAssets'


import { useBrowserWeb3 } from '@/web3/BrowserWeb3Provider'
import fetchWalletStatus from '@/qrcode_helpers/fetchWalletStatus'

import { WORK_CHAIN_ID } from '@/config'
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
    }
  }, [ browserAccount ])
  return (
    <>
      <h1>Account page</h1>
      <div>
        <div>
          <label>You address:</label>
          <strong>{browserAccount}</strong>
          <a href="#/account/backup">[Backup]</a>
          <a href="#/account/restore">[Restore from seed]</a>
        </div>
        <div>
          <label>You balance:</label>
          <strong>{fromWei(balance, factoryStatus.tokenDecimals)}</strong>
          <em>{factoryStatus.tokenSymbol}</em>
          <a href="#/bridge">[Convert]</a>
        </div>
      </div>
    </>
  )
}
