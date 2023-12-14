import type { AppProps } from "next/app"
import Head from 'next/head'

import { useRouter } from "next/router"
import { useEffect, useState } from "react"

import HashRouterViews from '@/components/HashRouterViews'

import Home from '@/views/Home'
import Page404 from '@/pages/404'

// Admin views
import AdminPanel from '@/views/AdminPanel/'
import AdminPanelManagersList from '@/views/AdminPanel/Managers/List'
import AdminPanelManagersAdd from '@/views/AdminPanel/Managers/Add'
import AdminPanelManagersInfo from '@/views/AdminPanel/Managers/Info'
import AdminPanelManagersDelete from '@/views/AdminPanel/Managers/Delete'

// Manager views
import ManagerPanel from '@/views/ManagerPanel/'
// Minter views
import MinterPanel from '@/views/MinterPanel/'
// Claimer views
import ClaimerPanel from '@/views/ClaimerPanel/'

import Web3Connector from '@/web3/Web3Connector'

import { ConnectWalletButton } from '@/web3/ConnectWalletButton'
import { ConnectWallet } from '@/web3/components/ConnectWallet'

function MyApp(pageProps) {
  return (
    <>
      <Web3Connector chainIds={[800500,97]} autoConnect={true}>
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
        <nav>
          <a href="#/admin">[Admin panel]</a>
          <a href="#/manager">[Manager panel]</a>
          <a href="#/minter">[Minter panel]</a>
          <a href="#/claimer">[Claimer panel]</a>
        </nav>
        <HashRouterViews
          views={{
            '/': Home,
            
            '/admin/': AdminPanel,
            '/admin/managers/': AdminPanelManagersList,
            '/admin/managers/add': AdminPanelManagersAdd,
            '/admin/managers/info/:managerAddress': AdminPanelManagersInfo,
            '/admin/managers/delete/:managerAddress': AdminPanelManagersDelete,
            
            '/manager/': ManagerPanel,
            
            '/minter/': MinterPanel,
            
            '/claimer/': ClaimerPanel,
          }}
          on404={Page404}
        />
      </Web3Connector>
    </>
  )
}

export default MyApp;
