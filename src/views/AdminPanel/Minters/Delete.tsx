
import { useEffect, useState, Component } from "react"
import { getAssets } from '@/helpers/getAssets'

import { useAccount } from 'wagmi'

import callQRFactoryMethod from '@/qrcode_helpers/callQRFactoryMethod'
import { QRCODE_FACTORY } from '@/config'

export default function AdminPanelMinterDelete(props) {
  const {
    gotoPage,
    factoryStatus,
    params: {
      minterAddress
    }
  } = props
  
  const { address: connectedWallet } = useAccount()
  const account = useAccount()
  
  const [ isRemovingMinter, setIsRemovingMinter ] = useState(false)
  const [ isRemovedMinter, setIsRemovedMinter ] = useState(false)
  
  const doRemoveMinter = () => {
    setIsRemovingMinter(true)
    callQRFactoryMethod({
      account,
      contractAddress: QRCODE_FACTORY,
      method: 'setIsMinter',
      args: [
        minterAddress,
        false
      ]
    }).then((asd) => {
      setIsRemovingMinter(false)
      setIsRemovedMinter(true)
    }).catch((err) => {
      setIsRemovingMinter(false)
      console.log('>>>', err)
    })
  }
  return (
    <>
      <h3>AdminPanel - Minters - Info</h3>
      <nav>
        <a href="#/admin/minters/">[Back]</a>
      </nav>
      {(factoryStatus.managers.indexOf(connectedWallet) != -1) || (connectedWallet.toLowerCase() == factoryStatus.owner.toLowerCase()) ? (
        <>
          <div>
            {!isRemovedMinter ? (
              <>
                <div>Confirm remove minter {minterAddress}</div>
                <button onClick={doRemoveMinter} disabled={isRemovingMinter}>Remove this minter</button>
              </>
            ) : (
              <>
                <div>Minter {minterAddress} removed</div>
                <a href="#/admin/minters/">[Back]</a>
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
