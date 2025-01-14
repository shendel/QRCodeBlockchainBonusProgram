import type { AppProps } from "next/app"
import { useEffect, useState } from "react"

import '@/styles/global.css'

import { init as initTgApp } from '@telegram-apps/sdk';
import * as TgSdk from '@telegram-apps/sdk';

const initializeTelegramSDK = async () => {
  try {
    // Attempt to initialize the real Telegram environment
    initTgApp()
  } catch (error) {}
};

function MyApp({ Component, pageProps }: AppProps) {
  const [isServer, setIsServer] = useState(true)
  
  initializeTelegramSDK()

  useEffect(() => {
    setIsServer(false)
  }, [])
  if (isServer) return null

  window.TgSdk = TgSdk
  return (
    <div suppressHydrationWarning>
      {typeof window === 'undefined' ? null : <Component {...pageProps} />}
    </div>
  )
}

export default MyApp;
