
import { useEffect, useState, Component } from "react"
import { getAssets } from '@/helpers/getAssets'
import { useAccount } from 'wagmi'

import callQRFactoryMethod from '@/qrcode_helpers/callQRFactoryMethod'
import { QRCODE_FACTORY } from '@/config'


export default function AdminPanelManagersAdd(props) {
  const {
    gotoPage,
    factoryStatus,
  } = props
  const { address: connectedWallet } = useAccount()
  const account = useAccount()
  

  const [ newManagerAddress, setNewManagerAddress ] = useState(`0x`)
   
  const [ isAddNewManager, setIsAddNewManager ] = useState(false)
  const [ isNewManagerAdded, setIsNewManagerAdded ] = useState(false)
  
  const onAddNewManager = () => {
    setIsAddNewManager(true)
    callQRFactoryMethod({
      account,
      contractAddress: QRCODE_FACTORY,
      method: 'setIsManager',
      args: [
        newManagerAddress,
        true
      ]
    }).then((asd) => {
      setIsAddNewManager(false)
      setIsNewManagerAdded(true)
    }).catch((err) => {
      setIsNewManagerAdded(false)
      console.log('>>>', err)
    })
  }
  return (
    <>
      <h3>AdminPanel - Managers - Add</h3>
      <nav>
        <a href="#/admin/managers/">[Back]</a>
      </nav>
      {connectedWallet.toLowerCase() == factoryStatus.owner.toLowerCase() ? (
        <>
          {!isNewManagerAdded ? (
            <>
              <div className="adminForm">
                <header>Add new manager</header>
                <div className="inputHolder">
                  <label>Manager address:</label>
                  <input type="text" value={newManagerAddress} onChange={(e) => { setNewManagerAddress(e.target.value) }} />
                </div>
                <div className="buttonsHolder">
                  <button disabled={isAddNewManager} onClick={onAddNewManager}>
                    {(isAddNewManager) ? `Addeding new manager` : `Add new manager`}
                  </button>
                  <button disabled={isAddNewManager} onClick={() => { gotoPage(`/admin/managers`) }} className="isCancel">{`Cancel`}</button>
                </div>
              </div>
            </>
          ) : (
            <div>
              <h4>New manager {newManagerAddress} added</h4>
              <a href="#/admin/managers/">[Back]</a>
            </div>
          )}
        </>
      ) : (
        <div>Access dinied</div>
      )}
    </>
  )
}
