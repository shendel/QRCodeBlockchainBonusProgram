import { useEffect, useState, Component } from "react"
import { getAssets } from '@/helpers/getAssets'
import { useAccount } from 'wagmi'

import { QRCODE_ROLES, checkRole } from '@/qrcode_helpers/checkRole'

import fetchQRCodeInfo from '@/qrcode_helpers/fetchQRCodeInfo'
import { QRCODE_FACTORY, WORK_CHAIN_ID } from '@/config'

import { fromWei } from '@/helpers/wei'
import getConfig from 'next/config'

import QRCode from "react-qr-code"
import styles from "./index.module.scss"
import { PROJECT_TITLE } from '@/config'
import HeaderRow from '@/components/qrcode/HeaderRow'

export default function QrCodeView(props) {
  const {
    gotoPage,
    factoryStatus,
    params: {
      qrCodeAddress
    }
  } = props
  
  const [ useTelegramLink, setUseTelegramLink ] = useState(false)
  const { publicRuntimeConfig } = getConfig()
  const {
    CLAIMER_URL,
    TELEGRAM_APP_LINK,
  } = publicRuntimeConfig
  
  const { address: connectedWallet } = useAccount()
  const account = useAccount()

  const [ isQrCodeFetching, setIsQrCodeFetching ] = useState(true)
  const [ isQrCodeFetched, setIsQrCodeFetched ] = useState(false)
  const [ qrCodeInfo, setQrCodeInfo ] = useState(false)
  
  const claimerBackEnd = (process.env.NODE_ENV == 'production') ? `${CLAIMER_URL}` : 'http://localhost:3000'
  const webLink = `${claimerBackEnd}/#/qrcodeclaim/${qrCodeAddress}`
  const tgLink = `${TELEGRAM_APP_LINK}?startapp=${qrCodeAddress}`
  const [ qrCodeLink, setQrCodeLink ] = useState((useTelegramLink) ? tgLink : webLink)


  useEffect(() => {
    setIsQrCodeFetching(true)
    setIsQrCodeFetched(false)
    fetchQRCodeInfo({
      chainId: WORK_CHAIN_ID,
      address: qrCodeAddress,
    }).then((answer) => {
      console.log('QRCode Info', answer)
      setQrCodeInfo(answer)
      setIsQrCodeFetched(true)
      setIsQrCodeFetching(false)
    }).catch((err) => {
      setIsQrCodeFetched(false)
      setIsQrCodeFetching(false)
      console.log('err', err)
    })
  }, [ qrCodeAddress ] )

  return (
    <div className={styles.viewPanel}>
      <HeaderRow 
        title={PROJECT_TITLE}
        backUrl={`/`}
        gotoPage={gotoPage}
      />
      {isQrCodeFetching && (
        <div className={`${styles.spinner} ${styles.blue}`}></div>
      )}
      {!isQrCodeFetching && !isQrCodeFetched && (
        <div>Fail fetch QRCode info</div>
      )}
      {isQrCodeFetched && qrCodeInfo && (
        <>
          <div className={styles.amountInfo}>
            <span>
              {`Scan code for get`}
            </span>
            <strong>
              {fromWei(qrCodeInfo.amount, qrCodeInfo.decimals)}
              {` `}
              {qrCodeInfo.symbol}
            </strong>
          </div>
          <div className={styles.qrCodeHolder}>
            <div>
              <QRCode
                size={256}
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                value={qrCodeLink}
                viewBox={`0 0 256 256`}
              />
            </div>
          </div>
          {(process.env.NODE_ENV != 'production') && (
            <div>
              <strong>
                <a href={qrCodeLink} _target="_blank" >
                  {qrCodeLink}
                </a>
              </strong>
            </div>
          )}
        </>
      )}
    </div>
  )
}
