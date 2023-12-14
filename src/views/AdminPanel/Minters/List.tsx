
import { useEffect, useState, Component } from "react"
import { getAssets } from '@/helpers/getAssets'

import fetchQRFactoryInfo from '@/qrcode_helpers/fetchQRFactoryInfo'
import fetchQRFactoryMinters from '@/qrcode_helpers/fetchQRFactoryMinters'
import { fromWei } from '@/helpers/wei'
import { WORK_CHAIN_ID, QRCODE_FACTORY } from '@/config'

export default function AdminPanelMinersList(props) {
  const {
    gotoPage,
    factoryStatus,
  } = props

  const [ isMintersFetching, setIsMintersFetching ] = useState(false)
  const [ isMintersFetched, setIsMintersFetched ] = useState(false)
  const [ minters, setMinters ] = useState([])
  
  useEffect(() => {
    if (factoryStatus) {
      fetchQRFactoryMinters({
        chainId: WORK_CHAIN_ID,
        address: QRCODE_FACTORY,
      }).then((answ) => {
        setMinters(answ.minters)
        setIsMintersFetched(true)
        setIsMintersFetching(false)
      }).catch((err) => {
        setIsMintersFetched(false)
        setIsMintersetching(false)
      })
    }
  }, [ factoryStatus ])
  return (
    <>
      <h3>AdminPanel - Minters</h3>
      <nav>
        <a href="#/admin/minters/add">[Add new minter]</a>
      </nav>
      {isMintersFetching && (
        <div>Fetching minters</div>
      )}
      {!isMintersFetching && !isMintersFetched && (
        <div>Fail fetch minters</div>
      )}
      {isMintersFetched && (
        <table border="1" width="100%">
          <thead>
            <tr>
              <td rowSpan="2">#</td>
              <td rowSpan="2">Name / Address</td>
              <td colSpan="3">{factoryStatus.tokenSymbol}</td>
              <td>Minted QRCodes</td>
              <td rowSpan="2">Options</td>
            </tr>
            <tr>
              <td>Balance</td>
              <td>Minted</td>
              <td>Claimed</td>
            </tr>
          </thead>
          <tbody>
            {minters.length > 0 ? (
              <>
                {minters.map((minterInfo, key) => {
                  const {
                    minterAddress,
                    name,
                    mintedAmount,
                    claimedAmount,
                    mintedQrCodesCount,
                    balance,
                  } = minterInfo
                  return (
                    <tr key={key}>
                      <td>{key+1}</td>
                      <td>
                        <div>{name}</div>
                        <a href={`#/admin/minters/info/${minterAddress}`}>{minterAddress}</a>
                      </td>
                      <td>
                        {fromWei(balance, factoryStatus.tokenDecimals)}
                      </td>
                      <td>
                        {fromWei(mintedAmount, factoryStatus.tokenDecimals)}
                      </td>
                      <td>
                        {fromWei(claimedAmount, factoryStatus.tokenDecimals)}
                      </td>
                      <td>
                        <a href={`#/admin/minters/qrcodes/${minterAddress}`}>{mintedQrCodesCount}</a>
                      </td>
                      <td>
                        <a href={`#/admin/minters/info/${minterAddress}`}>[INFO]</a>
                        <a href={`#/admin/minters/delete/${minterAddress}`}>[DELETE]</a>
                      </td>
                    </tr>
                  )
                })}
              </>
            ) : (
              <tr>
                <td colSpan="6">No managers</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </>
  )
}
