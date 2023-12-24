
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


export default function AdminPanelClaimersBan(props) {
  const t = getTranslate('CLAIMER_BAN')
  const {
    gotoPage,
    factoryStatus,
    params: {
      claimerAddress
    }
  } = props

  const STEPS = {
    REASON: 'REASON',
    CONFIRM: 'CONFIRM',
    READY: 'READY'
  }
  
  const {
    injectedAccount,
    injectedWeb3
  } = useInjectedWeb3()
  const [ step, setStep ] = useState(STEPS.REASON)
  const [ isLoading, setIsLoading ] = useState(false)
  const [ banReason, setBanReason ] = useState(``)
  const [ banReasonError, setBanReasonError ] = useState(true)

  useEffect(() => {
    if (claimerAddress) {
      setStep(STEPS.REASON)
      setBanReason('')
      setIsLoading(false)
    }
  }, [ claimerAddress ])

  useEffect(() => {
    setBanReasonError(false)
  }, [ banReason ])

  const gotoConfirm = () => {
    if (!banReason) return setBanReasonError(true)
    setStep(STEPS.CONFIRM)
  }

  const doBan = () => {
    setIsLoading(true)
    callQRFactoryMethod({
      activeWallet: injectedAccount,
      activeWeb3: injectedWeb3,
      contractAddress: QRCODE_FACTORY,
      method: 'addClaimerBan',
      args: [ claimerAddress, banReason ],
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
      <h3>AdminPanel - Claimers - Ban</h3>
      <nav>
        <a href="#/admin/claimers/">[Back]</a>
      </nav>

      <div className={`adminForm ${(isLoading) ? 'isLoading' : ''}`}>
        <header>{t('Ban claimer')}</header>
        <div className="inputHolder">
          <label>
            {t('Address')}
          </label>
          <div className="infoRow">{claimerAddress}</div>
        </div>
        {step == STEPS.REASON && (
          <>
            <div className="inputHolder">
              <label className="required">{t('Ban reason')}</label>
              <div>
                <input
                  type="text"
                  className={(banReasonError) ? 'hasError' : ''}
                  value={banReason}
                  onChange={(e) => { setBanReason(e.target.value) }}
                />
                {banReasonError && (
                  <div className="error">{t('Ban reason is required')}</div>
                )}
              </div>
            </div>
            <div className="buttonsHolder">
              <button className="isRed" onClick={() => { gotoConfirm() }}>{t('Add to banlist')}</button>
              <button className="isCancel" onClick={() => { gotoPage(`#/admin/claimers/info/${claimerAddress}`) }}>{t(`Cancel`)}</button>
            </div>
          </>
        )}
        {step == STEPS.CONFIRM && (
          <>
            <div className="inputHolder">
              <label>{t('Reason of ban')}</label>
              <div className="infoRow">{banReason}</div>
            </div>
            <div className="greenInfoBox">
              {t('Ban this claimer address?')}
            </div>
            <div className="buttonsHolder">
              <button className="isRed" onClick={() => { doBan() }}>{t('Yes, add this claimer to banlist')}</button>
              <button className="isCancel" onClick={() => { setStep(STEPS.REASON) }}>{t(`Go back`)}</button>
              <button className="isCancel" onClick={() => { gotoPage(`#/admin/claimers/info/${claimerAddress}`) }}>{t(`Cancel`)}</button>
            </div>
          </>
        )}
        {step == STEPS.READY && (
          <>
            <div className="greenInfoBox">
              {t('Claimer {claimerAddress} added to banlist with reason "{banReason}"', { claimerAddress, banReason })}
            </div>
            <div className="buttonsHolder">
              <button className="isGreen" onClick={() => { gotoPage(`#/admin/claimers/0`) }}>{t('Ready')}</button>
            </div>
          </>
        )}
      </div>
    </>
  )
}
