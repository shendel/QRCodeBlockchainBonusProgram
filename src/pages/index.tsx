import type { AppProps } from "next/app"
import Head from 'next/head'
import getConfig from 'next/config'


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

import AdminPanelClaimers from '@/views/AdminPanel/Claimers/List'
import AdminPanelClaimersInfo from '@/views/AdminPanel/Claimers/Info'
import AdminPanelClaimersBan from '@/views/AdminPanel/Claimers/Ban'
import AdminPanelClaimersUnban from '@/views/AdminPanel/Claimers/Unban'

import AdminPanelBridgeWithdrawTokens from '@/views/AdminPanel/BridgeWithdrawTokens'
// Manager views
import ManagerPanel from '@/views/ManagerPanel/'
// Minter views
import MinterPanel from '@/views/MinterPanel/'
import MinterMint from '@/views/MinterPanel/Mint'
import MinterMintedCodes from '@/views/MinterPanel/MintedCodes'
import MinterAddBonusPointsPanel from '@/views/MinterPanel/AddBonusPoints'
// Claimer views
import ClaimerPanel from '@/views/ClaimerPanel/'
import ClaimerPanelScanQRCode from '@/views/ClaimerPanel/ScanQRCode'
import ClaimerWithdrawPanel from '@/views/ClaimerPanel/Withdraw'

import QrCodeView from '@/views/QrCodeView/'
import QrCodeClaim from '@/views/QrCodeClaim/'


import Account from '@/views/Account/'
import AccountBackup from '@/views/Account/Backup'
import AccountRestore from '@/views/Account/Restore'

import Bridge from '@/views/Bridge/'

import AppRoot from '@/components/AppRoot'

import fetchQRFactoryInfo from '@/qrcode_helpers/fetchQRFactoryInfo'
import fetchBridgeInfo from '@/qrcode_helpers/fetchBridgeInfo'
import fetchBalance from '@/helpers/fetchBalance'
import fetchTokenInfo from '@/helpers/fetchTokenInfo'

import {
  WORK_CHAIN_ID,
  MAINNET_CHAIN_ID,

  QRCODE_FACTORY,

  BACKEND_CLAIMER,

  BRIDGE_ORACLE,
  BRIDGE_WORK_CONTRACT,
  BRIDGE_MAINNET_CONTRACT,
  MINTER_BRIDGE_TOKEN,
} from '@/config'

import { useLaunchParams } from '@telegram-apps/sdk-react';


function MyApp(pageProps) {
  const { publicRuntimeConfig } = getConfig()
  const {
    CLAIMER: isClaimerBuild,
    MINTER: isMinterBuild,
  } = publicRuntimeConfig
  
  /* Telegram routing */
  let telegramLaunchParams = false
  try {
    telegramLaunchParams  = useLaunchParams();
  } catch (e) {}
  
  const processTgHash = (hash) => {
    if (hash.startsWith(`tgWebAppData=`)) {
      if (telegramLaunchParams && telegramLaunchParams.startParam) {
        return `/qrcodeclaim/${telegramLaunchParams.startParam}`
      } else {
        return '/'
      }
    }
    return hash;
  }
  /* --------------- */
  
  const [ isFactoryFetching, setIsFactoryFetching ] = useState(true)
  const [ isFactoryFetched, setIsFactoryFetched ] = useState(false)
  const [ factoryStatus, setFactoryStatus ] = useState(false)
  const [ needUpdateFactoryStatus, setNeedUpdateFactoryStatus ] = useState(false)

  const [ backendStatus, setBackendStatus ] = useState({
    claimer_balance: 0,
    bridge_qrcode_balance: 0,
    bridge_qrcode_tokenBalance: 0,
    bridge_qrcode_tokenDecimals: 0,
    bridge_qrcode_tokenSymbol: '',
    bridge_mainnet_balance: 0,
    bridge_mainnet_tokenBalance: 0,
    bridge_mainnet_tokenDecimals: 0,
    bridge_mainnet_tokenSymbol: '',
    minter_bridge_token: {
      symbol: '',
      decimals: 0,
    },
  })
  const [ needUpdateBackendStatus, setNeedUpdateBackendStatus ] = useState(false)

  const _fetchBackendStatus = () => {
    const updateBackendStatus = (args) => {
      setBackendStatus((prev) => {
        return { ...prev, ...args }
      })
    }
    // Fetch energy balances
    fetchBalance({
      address: BACKEND_CLAIMER,
      chainId: WORK_CHAIN_ID,
    }).then((balance) => {
      updateBackendStatus({claimer_balance: balance})
    })
    fetchBalance({
      address: BRIDGE_ORACLE,
      chainId: WORK_CHAIN_ID,
    }).then((balance) => {
      updateBackendStatus({bridge_qrcode_balance: balance})
    })
    fetchBalance({
      address: BRIDGE_ORACLE,
      chainId: MAINNET_CHAIN_ID,
    }).then((balance) => {
      updateBackendStatus({bridge_mainnet_balance: balance})
    })
    fetchTokenInfo(MINTER_BRIDGE_TOKEN, MAINNET_CHAIN_ID).then((tokenInfo) => {
      updateBackendStatus({ minter_bridge_token: tokenInfo })
    })
    // Fetch mainnet bridge info
    fetchBridgeInfo({
      address: BRIDGE_MAINNET_CONTRACT,
      chainId: MAINNET_CHAIN_ID,
    }).then((bridgeMainnet) => {
      updateBackendStatus({
        bridge_mainnet_tokenBalance: bridgeMainnet.tokenBalance,
        bridge_mainnet_tokenDecimals: bridgeMainnet.tokenDecimals,
        bridge_mainnet_tokenSymbol: bridgeMainnet.tokenSymbol
      })
      // Fetch workchain bridge info
      fetchBridgeInfo({
        address: BRIDGE_WORK_CONTRACT,
        chainId: WORK_CHAIN_ID,
      }).then((bridgeWorkchain) => {
        updateBackendStatus({
          bridge_qrcode_tokenBalance: bridgeWorkchain.tokenBalance,
          bridge_qrcode_tokenDecimals: bridgeWorkchain.tokenDecimals,
          bridge_qrcode_tokenSymbol: bridgeWorkchain.tokenSymbol,
        })
      }).catch((err) => {
        console.log('>> error fetch workchain bridge info', err)
      })
    }).catch((err) => {
      console.log('>> error fetch mainnet bridge info', err)
    })
  }

  useEffect(() => {
    console.log('>> useEffect - fetch bridge status')
    _fetchBackendStatus()
  }, [
    BRIDGE_MAINNET_CONTRACT,
    BRIDGE_WORK_CONTRACT,
  ])

  useEffect(() => {
    if (needUpdateBackendStatus) {
      setNeedUpdateBackendStatus(false)
      _fetchBackendStatus()
    }
  }, [ needUpdateBackendStatus ])

  const UpdateBackendStatus = () => {
    setNeedUpdateBackendStatus(true)
  }

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

  let viewsPaths = {
    '/': Home,

    '/admin/': AdminPanel,
    
    '/admin/addenergy/:target': AdminPanelAddEnergy,
    '/admin/addtokens/:target': AdminPanelAddTokens,
    
    '/admin/managers/': AdminPanelManagersList,
    '/admin/managers/add': AdminPanelManagersAdd,
    '/admin/managers/info/:managerAddress': AdminPanelManagersInfo,
    '/admin/managers/delete/:managerAddress': AdminPanelManagersDelete,

    '/admin/minters/': AdminPanelMintersList,
    '/admin/minters/add': AdminPanelMinersAdd,
    '/admin/minters/delete/:minterAddress': AdminPanelMinterDelete,
    '/admin/minters/qrcodes/:minterAddress/:page': AdminPanelMintersQrCodes,

    '/admin/claimers/:page': AdminPanelClaimers,
    '/admin/claimers/info/:claimerAddress': AdminPanelClaimersInfo,
    '/admin/claimers/ban/:claimerAddress': AdminPanelClaimersBan,
    '/admin/claimers/unban/:claimerAddress': AdminPanelClaimersUnban,

    '/admin/bridge/withdraw/:target': AdminPanelBridgeWithdrawTokens,

    '/manager/': ManagerPanel,

    '/minter/': MinterPanel,
    '/minter/mint': MinterMint,
    '/minter/addpoints': MinterAddBonusPointsPanel,
    '/minter/codes/:type/:page': MinterMintedCodes,

    '/claimer/': ClaimerPanel,
    '/claimer/scanqrcode/': ClaimerPanelScanQRCode,
    '/claimer/withdraw/': ClaimerWithdrawPanel,
    
    '/qrcodeview/:qrCodeAddress': QrCodeView,
    '/qrcodeclaim/:qrCodeAddress': QrCodeClaim,
    
    '/account/': Account,
    '/account/backup/': AccountBackup,
    '/account/restore/': AccountRestore,
    
    '/bridge/': Bridge
  }
  if (isMinterBuild) {
    viewsPaths = {
      '/': MinterPanel,
      '/minter/': MinterPanel,
      '/minter/mint': MinterMint,
      '/minter/addpoints': MinterAddBonusPointsPanel,
      '/minter/codes/:type/:page': MinterMintedCodes,
      
      '/qrcodeview/:qrCodeAddress': QrCodeView,
      
      '/account/': Account,
      '/account/backup/': AccountBackup,
      '/account/restore/': AccountRestore,
    }
  }
  if (isClaimerBuild) {
    viewsPaths = {
      '/': ClaimerPanel,

      '/claimer/': ClaimerPanel,
      '/claimer/scanqrcode/': ClaimerPanelScanQRCode,
      '/claimer/withdraw/': ClaimerWithdrawPanel,
      
      '/qrcodeview/:qrCodeAddress': QrCodeView,
      '/qrcodeclaim/:qrCodeAddress': QrCodeClaim,
      
      '/account/': Account,
      '/account/backup/': AccountBackup,
      '/account/restore/': AccountRestore,
      
      '/bridge/': Bridge
    }
  }
  
  return (
    <>
      <AppRoot chainId={WORK_CHAIN_ID} chainIds={[WORK_CHAIN_ID, MAINNET_CHAIN_ID]}>
        <>
          {!isClaimerBuild && !isMinterBuild && (
            <>
              <Header />
              <h3>Index page</h3>
              {isFactoryFetching && (
                <div>Fetching QRCodeFactory ({QRCODE_FACTORY}) status</div>
              )}
              {!isFactoryFetching && !isFactoryFetched && (
                <div>Fail fetch QRCodeFactory ({QRCODE_FACTORY}) status</div>
              )}
            </>
          )}
          {isFactoryFetched && (
            <>
              {!isClaimerBuild && !isMinterBuild && (
                <nav>
                  <a href="#/admin">[Admin panel]</a>
                  <a href="#/manager">[Manager panel]</a>
                  <a href="#/minter">[Minter panel]</a>
                  <a href="#/claimer">[Claimer panel]</a>
                </nav>
              )}
              <HashRouterViews
                views={viewsPaths}
                processHash={processTgHash}
                props={{
                  factoryStatus,
                  backendStatus,
                  UpdateFactoryStatus,
                  UpdateBackendStatus,
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
