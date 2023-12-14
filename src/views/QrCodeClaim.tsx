
import { useEffect, useState, Component } from "react"
import { getAssets } from '@/helpers/getAssets'
import { useAccount } from 'wagmi'

import { QRCODE_ROLES, checkRole } from '@/qrcode_helpers/checkRole'

import fetchQRCodeInfo from '@/qrcode_helpers/fetchQRCodeInfo'
import { QRCODE_FACTORY, WORK_CHAIN_ID } from '@/config'

import { fromWei } from '@/helpers/wei'

export default function QrCodeClaim(props) {
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

  const doClaimCode = () => {
  }
  
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
          {qrCodeInfo.isClaimed ? (
            <div>QRCode is already claimed</div>
          ) : (
            <>
              {qrCodeInfo.isValid ? (
                <div>
                  <div>Process claim</div>
                  
                  <button onClick={doClaimCode}>Claim</button>
                </div>
              ) : (
                <div>QRCode expired</div>
              )}
            </>
          )}
        </>
      )}
    </>
  )
}
