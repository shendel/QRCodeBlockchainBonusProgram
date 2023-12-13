import type { AppProps } from "next/app"
import Head from 'next/head'

import { useRouter } from "next/router"
import { useEffect, useState } from "react"

import HashRouterViews from '@/components/HashRouterViews'
import Accounts from '@/views/Accounts'
import AccountInfo from '@/views/AccountInfo'
import AccountTxs from '@/views/AccountTxs'
import Home from '@/views/Home'
import Page404 from '@/pages/404'

import Web3Connector from '@/web3/Web3Connector'

import { ConnectWalletButton } from '@/web3/ConnectWalletButton'
import { ConnectWallet } from '@/web3/components/ConnectWallet'

function MyApp(pageProps) {
  return (
    <>
      <Web3Connector chainIds={[5,97]} autoConnect={true}>
        <ConnectWalletButton
          connectView={(isConnecting, openConnectModal) => {
            return (
              <button disabled={isConnecting} onClick={openConnectModal}>Do connect</button>
            )
          }}
          connectedView={(address) => {
            return (<div>[{address}]</div>)
          }}
          wrongChainView={(openChainModal) => {
            return (
              <button onClick={openChainModal}>
                Switch chain
              </button>
            )
          }}
        />
        <h3>Index page</h3>
        <HashRouterViews
          views={{
            '/': Home,
            '/accounts': Accounts,
            '/account/:account': AccountInfo,
            '/account/:account/txs': AccountTxs
          }}
          on404={Page404}
        />
      </Web3Connector>
    </>
  )
}

export default MyApp;
