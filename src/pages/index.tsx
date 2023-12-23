import type { AppProps } from "next/app"
import Head from 'next/head'

import { useRouter } from "next/router"
import { useEffect, useState } from "react"

import HashRouterViews from '@/components/HashRouterViews'


import Home from '@/views/Home'
import Page404 from '@/pages/404'

import Header from '@/components/qrcode/Header'
// Admin views
import AdminPanel from '@/views/AdminPanel/'

import AdminPanelAddEnergy from '@/views/AdminPanel/AddEnergy'
import AdminPanelAddTokens from '@/views/AdminPanel/AddTokens'

import AdminPanelManagersList from '@/views/AdminPanel/Managers/List'
import AdminPanelManagersAdd from '@/views/AdminPanel/Managers/Add'
import AdminPanelManagersInfo from '@/views/AdminPanel/Managers/Info'
import AdminPanelManagersDelete from '@/views/AdminPanel/Managers/Delete'

import AdminPanelMintersList from '@/views/AdminPanel/Minters/List'
import AdminPanelMinersAdd from '@/views/AdminPanel/Minters/Add'
import AdminPanelMinterDelete from '@/views/AdminPanel/Minters/Delete'
import AdminPanelMintersQrCodes from '@/views/AdminPanel/Minters/QRCodes'


// Manager views
import ManagerPanel from '@/views/ManagerPanel/'
// Minter views
import MinterPanel from '@/views/MinterPanel/'
import MinterMint from '@/views/MinterPanel/Mint'
// Claimer views
import ClaimerPanel from '@/views/ClaimerPanel/'


import QrCodeView from '@/views/QrCodeView'
import QrCodeClaim from '@/views/QrCodeClaim'



import AppRoot from '@/components/AppRoot'

import fetchQRFactoryInfo from '@/qrcode_helpers/fetchQRFactoryInfo'
import { WORK_CHAIN_ID, QRCODE_FACTORY } from '@/config'

function MyApp(pageProps) {
  const [ isFactoryFetching, setIsFactoryFetching ] = useState(true)
  const [ isFactoryFetched, setIsFactoryFetched ] = useState(false)
  const [ factoryStatus, setFactoryStatus ] = useState(false)
  const [ needUpdateFactoryStatus, setNeedUpdateFactoryStatus ] = useState(false)
  
  const _fetchFactoryStatus = () => {
    fetchQRFactoryInfo({
      chainId: WORK_CHAIN_ID,
      address: QRCODE_FACTORY,
    }).then((answ) => {
      setFactoryStatus(answ)
      setIsFactoryFetched(true)
      setIsFactoryFetching(false)
    }).catch((err) => {
      setIsFactoryFetched(false)
      setIsFactoryFetching(false)
    })
  }
  useEffect(() => {
    console.log('>> useEffect')
    _fetchFactoryStatus()
  }, [ QRCODE_FACTORY ])
  useEffect(() => {
    if(QRCODE_FACTORY && needUpdateFactoryStatus) {
      setNeedUpdateFactoryStatus(false)
      _fetchFactoryStatus()
    }
  }, [ QRCODE_FACTORY, needUpdateFactoryStatus ])
  
  const UpdateFactoryStatus = () => {
    setNeedUpdateFactoryStatus(true)
  }
  
  return (
    <>
      <AppRoot chainId={WORK_CHAIN_ID}>
        <>
          <Header />
          <h3>Index page</h3>
          {isFactoryFetching && (
            <div>Fetching QRCodeFactory ({QRCODE_FACTORY}) status</div>
          )}
          {!isFactoryFetching && !isFactoryFetched && (
            <div>Fail fetch QRCodeFactory ({QRCODE_FACTORY}) status</div>
          )}
          {isFactoryFetched && (
            <>
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
                  
                  '/admin/addenergy/:target': AdminPanelAddEnergy,
                  '/admin/addtokens': AdminPanelAddTokens,
                  
                  '/admin/managers/': AdminPanelManagersList,
                  '/admin/managers/add': AdminPanelManagersAdd,
                  '/admin/managers/info/:managerAddress': AdminPanelManagersInfo,
                  '/admin/managers/delete/:managerAddress': AdminPanelManagersDelete,

                  '/admin/minters/': AdminPanelMintersList,
                  '/admin/minters/add': AdminPanelMinersAdd,
                  '/admin/minters/delete/:minterAddress': AdminPanelMinterDelete,
                  '/admin/minters/qrcodes/:minterAddress/:page': AdminPanelMintersQrCodes,

                  '/manager/': ManagerPanel,

                  '/minter/': MinterPanel,
                  '/minter/mint': MinterMint,

                  '/claimer/': ClaimerPanel,
                  
                  '/qrcodeview/:qrCodeAddress': QrCodeView,
                  '/qrcodeclaim/:qrCodeAddress': QrCodeClaim,
                }}
                props={{
                  factoryStatus,
                  UpdateFactoryStatus
                }}
                on404={Page404}
              />
            </>
          )}
        </>
      </AppRoot>
    </>
  )
}

export default MyApp;
