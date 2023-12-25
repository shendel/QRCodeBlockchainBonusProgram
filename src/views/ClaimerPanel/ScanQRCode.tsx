
import { useEffect, useState, Component } from "react"
import { getAssets } from '@/helpers/getAssets'
import { QrReader } from 'react-qr-reader'
import isEvmAddress from '@/helpers/isEvmAddress'

export default function ClaimerPanelScanQRCode(props) {
  const {
    gotoPage,
  } = props
  
  const [ scanResult, setScanResult ] = useState(``)
  const [ scanError, setScanError ] = useState(``)
  
  const handleScan = (result) => {
    const parts = result.split('/').reverse()
    if (parts.length > 1) {
      if (isEvmAddress(parts[0]) && parts[1] == 'qrcodeclaim') {
        gotoPage(`/qrcodeclaim/${parts[0]}`)
      }
    }
  }
  
  return (
    <>
      <h2>Scan</h2>
      <h3>Scan result: {scanResult}</h3>
      <h3>Scan error: {scanError}</h3>
      <style>
      {`
        .scan {
          display: flex;
          flex-direction: column;
          -position: fixed;
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
          font-size: 30pt;
          color: #FFF;
        }
        .scan VIDEO {
          outline: 5px solid red;
          background: green;
        }
      `}
      </style>
      <div className="scan">
        <span className="close" onClick={() => { gotoPage('/claimer/') }}>
          &times;
        </span>
        <QrReader
          constraints={{ facingMode: { exact: 'environment' } }}
          onResult={(result, error) => {
            if (!!result) {
              handleScan(result?.getText())
              return
            }
            setScanError(error.message)
          }}
        />
      </div>
    </>
  )
}
