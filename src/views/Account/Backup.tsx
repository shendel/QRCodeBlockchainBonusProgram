
import { useEffect, useState, Component } from "react"
import { getAssets } from '@/helpers/getAssets'


import { useBrowserWeb3 } from '@/web3/BrowserWeb3Provider'


export default function AccountBackup(props) {
  const {
    gotoPage,
    factoryStatus
  } = props

  

  const browserAccount = useBrowserWeb3()
  console.log('>>> browserAccount',browserAccount)

  return (
    <>
      <h1>Account page - backup</h1>
      <div>
        <div>
          <label>You address:</label>
          <strong>{browserAccount.browserAccount}</strong>
        </div>
        <div>
          You seed: <strong>{browserAccount.browserMnemonic}</strong>
        </div>
      </div>
    </>
  )
}
