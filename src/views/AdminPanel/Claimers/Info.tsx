
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


export default function AdminPanelClaimersInfo(props) {
  const t = getTranslate('CLAIMER_INFO')
  const {
    gotoPage,
    factoryStatus,
    params: {
      claimerAddress
    }
  } = props

  const [ claimerInfo, setClaimerInfo ] = useState(false)
  const [ isClaimerFetched, setIsClaimerFetched ] = useState(false)
  const [ isClaimerFetching, setIsClaimerFetching ] = useState(true)

  const [ claimerEnergy, setClaimerEnergy ] = useState(0)
  const [ claimerBalance, setClaimerBalance ] = useState(0)
  const [ isClaimerBalanceFetching, setIsClaimerBalanceFetching ] = useState(true)

  useEffect(() => {
    setIsClaimerFetching(true)
    fetchClaimerInfo({
      address: factoryStatus.address,
      chainId: WORK_CHAIN_ID,
      claimer: claimerAddress,
    }).then((answer) => {
      console.log('answer', answer)
      setClaimerInfo(answer.claimer)
      setIsClaimerFetched(true)
      setIsClaimerFetching(false)
    }).catch((err) => {
      console.log('>> err')
    })
    // balance
    setIsClaimerBalanceFetching(true)
    fetchWalletStatus({
      address: claimerAddress,
      tokenAddress: factoryStatus.tokenAddress,
      chainId: WORK_CHAIN_ID
    }).then(({ energy, balance }) => {
      setClaimerEnergy(energy)
      setClaimerBalance(balance)
      setIsClaimerBalanceFetching(false)
    }).catch((err) => {
      console.log('>> err', err)
    })
  }, [ claimerAddress ])

  return (
    <>
      <h3>AdminPanel - Claimers - Info</h3>
      <nav>
        <a href="#/admin/claimers/">[Back]</a>
      </nav>

      <div className={`adminForm ${(isClaimerFetching) ? 'isLoading' : ''}`}>
        <header>{t('Claimer info')}</header>
        {isClaimerFetched && claimerInfo && (
          <>
            <div className="inputHolder">
              <label>
                Address
              </label>
              <div className="infoRow">{claimerAddress}</div>
            </div>
            <div className="inputHolder">
              <label>Status</label>
              {!isClaimerBalanceFetching ? (
                <div className="infoRow">
                  <label>Balance: {fromWei(claimerBalance, factoryStatus.tokenDecimals)} {factoryStatus.tokenSymbol}</label>
                  <label>Energy: {fromWei(claimerEnergy)}</label>
                </div>
              ) : (
                <div className="infoRow">Fetching</div>
              )}
            </div>
            <div className="inputHolder">
              <label>Energy requested from faucet: {fromWei(claimerInfo.faucetUsed)}</label>
              <label>
                {`Tokens claimed:`}
                {fromWei(claimerInfo.claimedAmount, factoryStatus.tokenDecimals)}
                {` `}
                {factoryStatus.tokenSymbol}
              </label>
              <label>QR-Codes claimed: {claimerInfo.claimedQrCodesCount}</label>
            </div>
          </>
        )}
        <div className="buttonsHolder">
          <button className="isCancel" onClick={() => { window.history.back() }}>{t(`Go back`)}</button>
          <button>Show claimed QR-Codes</button>
          <button className="isRed" onClick={() => { gotoPage(`/admin/claimers/ban/${claimerAddress}`) }}>Add to banlist</button>
        </div>
      </div>
    </>
  )
}
