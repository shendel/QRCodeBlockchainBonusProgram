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

function MyApp(pageProps) {
  return (
    <>
      <h3>Some other page</h3>
      <HashRouterViews
        views={{
          '/': Home,
          '/accounts': Accounts,
          '/account/:account': AccountInfo,
          '/account/:account/txs': AccountTxs
        }}
        on404={Page404}
      />
    </>
  )
}

export default MyApp;
