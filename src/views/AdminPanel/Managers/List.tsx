
import { useEffect, useState, Component } from "react"
import { getAssets } from '@/helpers/getAssets'

import fetchQRFactoryInfo from '@/qrcode_helpers/fetchQRFactoryInfo'
import fetchQRFactoryManagers from '@/qrcode_helpers/fetchQRFactoryManagers'
import { fromWei } from '@/helpers/wei'
import { WORK_CHAIN_ID, QRCODE_FACTORY } from '@/config'

export default function AdminPanelManagersList(props) {
  const {
    gotoPage,
    factoryStatus,
  } = props

  const [ isManagersFetching, setIsManagersFetching ] = useState(false)
  const [ isManagersFetched, setIsManagersFetched ] = useState(false)
  const [ managers, setManagers ] = useState([])
  
  useEffect(() => {
    if (factoryStatus) {
      fetchQRFactoryManagers({
        chainId: WORK_CHAIN_ID,
        address: QRCODE_FACTORY,
      }).then((answ) => {
        setManagers(answ.managers)
        setIsManagersFetched(true)
        setIsManagersFetching(false)
      }).catch((err) => {
        setIsManagersFetched(false)
        setIsManagersFetching(false)
      })
    }
  }, [ factoryStatus ])
  return (
    <>
      <h3>AdminPanel - Managers</h3>
      <nav>
        <a href="#/admin/managers/add">[Add new manager]</a>
      </nav>
      {isManagersFetching && (
        <div>Fetching managers</div>
      )}
      {!isManagersFetching && !isManagersFetched && (
        <div>Fail fetch managers</div>
      )}
      {isManagersFetched && (
        <div className="adminTable">
          <table>
            <thead>
              <tr>
                <td>#</td>
                <td>Address</td>
                <td>...</td>
                <td>Options</td>
              </tr>
            </thead>
            <tbody>
              {managers.length > 0 ? (
                <>
                  {managers.map((managerAddress, key) => {
                    return (
                      <tr key={key}>
                        <td>{key+1}</td>
                        <td><a href={`#/admin/managers/info/${managerAddress}`}>{managerAddress}</a></td>
                        <td>...</td>
                        <td>
                          <a href={`#/admin/managers/info/${managerAddress}`}>[INFO]</a>
                          <a href={`#/admin/managers/delete/${managerAddress}`}>[DELETE]</a>
                        </td>
                      </tr>
                    )
                  })}
                </>
              ) : (
                <tr>
                  <td colspan="4">No managers</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
