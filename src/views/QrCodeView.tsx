
import { useEffect, useState, Component } from "react"
import { getAssets } from '@/helpers/getAssets'
import { useAccount } from 'wagmi'

import { QRCODE_ROLES, checkRole } from '@/qrcode_helpers/checkRole'

import fetchQRCodeInfo from '@/qrcode_helpers/fetchQRCodeInfo'
import { QRCODE_FACTORY, WORK_CHAIN_ID } from '@/config'

import { fromWei } from '@/helpers/wei'


import QRCode from "react-qr-code"


export default function QrCodeView(props) {
  const {
    gotoPage,
    factoryStatus,
    params: {
      qrCodeAddress
    }
  } = props
  
  const { address: connectedWallet } = useAccount()
  const account = useAccount()

  const [ isQrCodeFetching, setIsQrCodeFetching ] = useState(true)
  const [ isQrCodeFetched, setIsQrCodeFetched ] = useState(false)
  const [ qrCodeInfo, setQrCodeInfo ] = useState(false)
  
  const [ qrCodeLink, setQrCodeLink ] = useState(`http://localhost:3000/#/qrcodeclaim/${qrCodeAddress}`)


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
    <>
      {isQrCodeFetching && (
        <div>Loading...</div>
      )}
      {!isQrCodeFetching && !isQrCodeFetched && (
        <div>Fail fetch QRCode info</div>
      )}
      {isQrCodeFetched && qrCodeInfo && (
        <>
          <div>QRCODE: { qrCodeAddress}</div>
          <div>
            <strong>{qrCodeInfo.minterName}</strong>
          </div>
          <div>
            <em>{qrCodeInfo.message}</em>
          </div>
          <div>
            <span>
              {`Scan code for get ${fromWei(qrCodeInfo.amount, qrCodeInfo.decimal)}`}
            </span>
            <strong>
              {qrCodeInfo.symbol}
            </strong>
          </div>
          <div style={{ height: "auto", margin: "0 auto", maxWidth: 320, width: "100%" }}>
              <QRCode
              size={256}
              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              value={qrCodeLink}
              viewBox={`0 0 256 256`}
              />
          </div>
          <div>
            <strong>
              <a href={qrCodeLink} target="_blank">
                {qrCodeLink}
              </a>
            </strong>
          </div>
        </>
      )}
    </>
  )
}
