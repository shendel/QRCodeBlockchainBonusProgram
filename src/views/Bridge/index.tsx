
import { useEffect, useState, Component } from "react"
import { getAssets } from '@/helpers/getAssets'


import { useBrowserWeb3 } from '@/web3/BrowserWeb3Provider'


export default function Bridge(props) {
  const {
    gotoPage,
    factoryStatus
  } = props
  
  const browserAccount = useBrowserWeb3()

  return (
    <>
      <h1>Bridge to mainnet</h1>
      
    </>
  )
}
