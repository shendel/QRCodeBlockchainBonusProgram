
import { useEffect, useState, Component } from "react"
import { getAssets } from '@/helpers/getAssets'
import { QrReader } from 'react-qr-reader'
import isEvmAddress from '@/helpers/isEvmAddress'

export default function ClaimerPanelScanQRCode(props) {
  const {
    gotoPage,
  } = props


  const handleScan = (result) => {
    console.log('>>> result', result)
    const parts = result.split('/').reverse()
    console.log('>>> parts', parts)
    if (parts.length > 1) {
      if (isEvmAddress(parts[0]) && parts[1] == 'qrcodeclaim') {
        gotoPage(`/qrcodeclaim/${parts[0]}`)
      }
      if (parts[2] && parts[2] == 't.me') {
        console.log('>>> is tg link')
        const qrCodeParts = parts[0].split('=')
        console.log(qrCodeParts)
        if (qrCodeParts.length == 2 && isEvmAddress(qrCodeParts[1]) && (qrCodeParts[0] == 'getbonus?startapp')) {
          gotoPage(`/qrcodeclaim/${qrCodeParts[1]}`)
        }
      }
    }
  }
  
  return (
    <>
      <style>
      {`
        .scan {
          display: flex;
          flex-direction: column;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: #000;
          width: 100%;
          height: 100%;
          z-index: 999999999999999999;
        }

        .close {
          text-align: right;
          position: relative;
          padding: 0.25em;
          font-size: 3em;
          color: #FFF;
          cursor: pointer;
        }
      `}
      </style>
      <div className="scan">
        <a className="close" onClick={() => { gotoPage('/claimer/') }}>
          &times;
        </a>
        <QrReader
          constraints={{
            facingMode: { exact: `environment` },
          }}
          onResult={(result, error) => {
            if (!!result) {
              handleScan(result?.getText())
              return
            }
          }}
        />
      </div>
    </>
  )
}
