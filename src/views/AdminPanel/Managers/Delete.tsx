
import { useEffect, useState, Component } from "react"
import { getAssets } from '@/helpers/getAssets'

import { useAccount } from 'wagmi'

import callQRFactoryMethod from '@/qrcode_helpers/callQRFactoryMethod'
import { QRCODE_FACTORY } from '@/config'

export default function AdminPanelManagersDelete(props) {
  const {
    gotoPage,
    factoryStatus,
    params: {
      managerAddress
    }
  } = props
  
  const { address: connectedWallet } = useAccount()
  const account = useAccount()
  
  const [ isRemovingManager, setIsRemovingManager ] = useState(false)
  const [ isRemovedManager, setIsRemovedManager ] = useState(false)
  
  const doRemoveManager = () => {
    setIsRemovingManager(true)
    callQRFactoryMethod({
      account,
      contractAddress: QRCODE_FACTORY,
      method: 'setIsManager',
      args: [
        managerAddress,
        false
      ]
    }).then((asd) => {
      setIsRemovingManager(false)
      setIsRemovedManager(true)
    }).catch((err) => {
      setIsRemovingManager(false)
      console.log('>>>', err)
    })
  }
  return (
    <>
      <h3>AdminPanel - Managers - Info</h3>
      <nav>
        <a href="#/admin/managers/">[Back]</a>
      </nav>
      {connectedWallet.toLowerCase() == factoryStatus.owner.toLowerCase() ? (
        <>
          <div>
            {!isRemovedManager ? (
              <>
                <div>Confirm remove manager {managerAddress}</div>
                <button onClick={doRemoveManager} disabled={isRemovingManager}>Remove this manager</button>
              </>
            ) : (
              <>
                <div>Manager {managerAddress} removed</div>
                <a href="#/admin/managers/">[Back]</a>
              </>
            )}
          </div>
        </>
      ) : (
        <div>Access dinied</div>
      )}
    </>
  )
}
