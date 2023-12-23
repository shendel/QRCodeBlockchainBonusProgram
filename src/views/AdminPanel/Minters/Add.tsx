
import { useEffect, useState, Component } from "react"
import { getAssets } from '@/helpers/getAssets'
import { useAccount } from 'wagmi'

import callQRFactoryMethod from '@/qrcode_helpers/callQRFactoryMethod'
import { useInjectedWeb3 } from '@/web3/InjectedWeb3Provider'
import { QRCODE_FACTORY } from '@/config'

import { translate as t } from '@/translate'

export default function AdminPanelMinersAdd(props) {
  const {
    gotoPage,
    factoryStatus,
  } = props
  const { address: connectedWallet } = useAccount()
  const {
    injectedAccount,
    injectedWeb3
  } = useInjectedWeb3()
  

  const [ newMinterAddress, setNewMinterAddress ] = useState(`0x`)
  const [ newMinterName, setNewMinterName ] = useState('')
   
  const [ isAddNewMinter, setIsAddNewMinter ] = useState(false)
  const [ isNewMinterAdded, setIsNewMinterAdded ] = useState(false)
  console.log('>>> factoryStatus', factoryStatus)
  window.factoryStatus = factoryStatus
  const onAddNewMinter = () => {
    setIsAddNewMinter(true)
    callQRFactoryMethod({
      activeWallet: injectedAccount,
      activeWeb3: injectedWeb3,
      contractAddress: QRCODE_FACTORY,
      method: 'addMinter',
      args: [
        newMinterAddress,
        newMinterName
      ]
    }).then((asd) => {
      setIsAddNewMinter(false)
      setIsNewMinterAdded(true)
    }).catch((err) => {
      setIsNewMinterAdded(false)
      console.log('>>>', err)
    })
  }
  
  return (
    <>
      <h3>AdminPanel - Minters - Add</h3>
      <nav>
        <a href="#/admin/minters/">[Back]</a>
      </nav>
      {true ? (
        <>
          {!isNewMinterAdded ? (
            <div className={`adminForm ${(isAddNewMinter) ? 'isLoading' : ''}`}>
              <header>Add new minter</header>
              <div className="inputHolder">
                <label className="required">
                  {t(`Minter address`)}
                </label>
                <input type="text" value={newMinterAddress} onChange={(e) => { setNewMinterAddress(e.target.value) }} />
              </div>
              <div className="inputHolder">
                <label>Minter name:</label>
                <input type="text" value={newMinterName} onChange={(e) => { setNewMinterName(e.target.value) }} />
              </div>
              <div className="buttonsHolder">
                <button disabled={isAddNewMinter} onClick={onAddNewMinter}>
                  {(isAddNewMinter) ? t(`Addeding new minter`) : t(`Add new minters`)}
                </button>
                <button className="isCancel" disabled={isAddNewMinter} onClick={() => { gotoPage(`/admin/minters/`) }}>{t(`Cancel`)}</button>
              </div>
            </div>
          ) : (
            <div>
              <h4>New manager {newMinterAddress} ({newMinterName}) added</h4>
              <a href="#/admin/minters/">[Back]</a>
            </div>
          )}
        </>
      ) : (
        <div>Access dinied</div>
      )}
    </>
  )
}
