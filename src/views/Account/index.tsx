
import { useEffect, useState, Component } from "react"
import { getAssets } from '@/helpers/getAssets'


import { useBrowserWeb3 } from '@/web3/BrowserWeb3Provider'


export default function Account(props) {
  const {
    gotoPage,
    factoryStatus
  } = props
  
  const browserAccount = useBrowserWeb3()

  return (
    <>
      <h1>Account page</h1>
      <div>
        <div>
          <label>You address:</label>
          <strong>{browserAccount.browserAccount}</strong>
          <a href="#/account/backup">[Backup]</a>
          <a href="#/account/restore">[Restore from seed]</a>
        </div>
        <div>
          <label>You balance:</label>
          <strong>0</strong>
          <em>{factoryStatus.tokenSymbol}</em>
          <a href="#/bridge">[Convert]</a>
        </div>
      </div>
    </>
  )
}
