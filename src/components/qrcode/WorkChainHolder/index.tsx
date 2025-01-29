import { useBrowserWeb3 } from '@/web3/BrowserWeb3Provider'
import { useEffect } from "react"

import {
  WORK_CHAIN_ID
} from '@/config'

export default function WorkChainHolder(props) {
  const {
    children
  } = props
  const {
    browserChainId,
    switchNetwork,
  } = useBrowserWeb3()
  
  useEffect(() => {
    if (browserChainId && browserChainId != WORK_CHAIN_ID) {
      switchNetwork(WORK_CHAIN_ID)
    }
  }, [ browserChainId ])
  
  return (
    <>
      {children}
    </>
  )
}