
import { useEffect, useState, Component } from "react"
import { getAssets } from '@/helpers/getAssets'
import { useAccount } from 'wagmi'

import callQRFactoryMethod from '@/qrcode_helpers/callQRFactoryMethod'
import fetchClaimerInfo from '@/qrcode_helpers/fetchClaimerInfo'
import { useInjectedWeb3 } from '@/web3/InjectedWeb3Provider'
import { QRCODE_FACTORY, WORK_CHAIN_ID } from '@/config'

import { getTranslate } from '@/translate'
import { fromWei } from '@/helpers/wei'

import fetchWalletStatus from '@/qrcode_helpers/fetchWalletStatus'


export default function AdminPanelClaimersUnban(props) {
  const t = getTranslate('CLAIMER_UNBAN')
  const {
    gotoPage,
    factoryStatus,
    params: {
      claimerAddress
    }
  } = props

  const STEPS = {
    CONFIRM: 'CONFIRM',
    READY: 'READY'
  }
  
  const {
    injectedAccount,
    injectedWeb3
  } = useInjectedWeb3()

  const [ step, setStep ] = useState(STEPS.CONFIRM)
  const [ isLoading, setIsLoading ] = useState(false)

  useEffect(() => {
    if (claimerAddress) {
      setStep(STEPS.CONFIRM)
      setIsLoading(false)
    }
  }, [ claimerAddress ])

  const doUnBan = () => {
    setIsLoading(true)
    callQRFactoryMethod({
      activeWallet: injectedAccount,
      activeWeb3: injectedWeb3,
      contractAddress: QRCODE_FACTORY,
      method: 'delClaimerBan',
      args: [ claimerAddress ],
    }).then((answer) => {
      setIsLoading(false)
      setStep(STEPS.READY)
    }).catch((err) => {
      setIsLoading(false)
      console.log(err)
    })
    //setStep(STEPS.READY)
  }
  return (
    <>
      <h3>AdminPanel - Claimers - Remove from ban</h3>
      <nav>
        <a href="#/admin/claimers/">[Back]</a>
      </nav>

      <div className={`adminForm ${(isLoading) ? 'isLoading' : ''}`}>
        <header>{t('Remove claimer from banlist')}</header>
        <div className="inputHolder">
          <label>
            {t('Address')}
          </label>
          <div className="infoRow">{claimerAddress}</div>
        </div>
        {step == STEPS.CONFIRM && (
          <>
            <div className="greenInfoBox">
              {t('Remove this claimer address from banlist?')}
            </div>
            <div className="buttonsHolder">
              <button className="isRed" onClick={() => { doUnBan() }}>{t('Yes, remove from banlist')}</button>
              <button className="isCancel" onClick={() => { gotoPage(`#/admin/claimers/info/${claimerAddress}`) }}>{t(`Cancel`)}</button>
            </div>
          </>
        )}
        {step == STEPS.READY && (
          <>
            <div className="greenInfoBox">
              {t('Claimer {claimerAddress} removed from banlist"', { claimerAddress })}
            </div>
            <div className="buttonsHolder">
              <button className="isGreen" onClick={() => { gotoPage(`#/admin/claimers/info/${claimerAddress}`) }}>{t('Ready')}</button>
            </div>
          </>
        )}
      </div>
    </>
  )
}
