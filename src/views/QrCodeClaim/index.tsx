import getConfig from 'next/config'

import { useEffect, useState, Component } from "react"
import { getAssets } from '@/helpers/getAssets'
import { useAccount } from 'wagmi'

import { QRCODE_ROLES, checkRole } from '@/qrcode_helpers/checkRole'

import fetchQRCodeInfo from '@/qrcode_helpers/fetchQRCodeInfo'
import callQRCodeMethod from '@/qrcode_helpers/callQRCodeMethod'

import { QRCODE_FACTORY, WORK_CHAIN_ID } from '@/config'
import { useBrowserWeb3 } from '@/web3/BrowserWeb3Provider'
import { useInjectedWeb3 } from '@/web3/InjectedWeb3Provider'

import { fromWei, toWei } from '@/helpers/wei'
import axios from 'axios'
import BigNumber from "bignumber.js"
import styles from "./index.module.scss"

import { PROJECT_TITLE } from '@/config'
import HeaderRow from '@/components/qrcode/HeaderRow'

import Avatar from '@/components/qrcode/Avatar'

export default function QrCodeClaim(props) {
  const {
    gotoPage,
    factoryStatus,
    params: {
      qrCodeAddress
    }
  } = props
  
  const { publicRuntimeConfig } = getConfig()
  const { BACKEND_URL } = publicRuntimeConfig

  const { address: connectedWallet, isConnected: isExternalWalletConnected } = useAccount()

  
  const injectedAccount = useInjectedWeb3()
  const browserAccount = useBrowserWeb3()
  
  const account = useAccount()

  const [ isQrCodeFetching, setIsQrCodeFetching ] = useState(true)
  const [ isQrCodeFetched, setIsQrCodeFetched ] = useState(false)
  const [ qrCodeInfo, setQrCodeInfo ] = useState(false)
  
  const [ claimToAddress, setClaimToAddress ] = useState(browserAccount.browserAccount) //useState((isExternalWalletConnected) ? connectedWallet : browserAccount.browserAccount)
  const [ oldClaimToAddress, setOldClaimToAddress ] = useState((isExternalWalletConnected) ? connectedWallet: browserAccount.browserAccount)
  const [ isEditClaimToAddress, setIsEditClaimToAddress ] = useState(false)

  const [ isClaiming, setIsClaiming ] = useState(false)
  const [ isClaimed, setIsClaimed ] = useState(false)
  const [ isNeedUpdate, setIsNeedUpdate ] = useState(false)



  const updateQrCodeInfo = () => {
    setIsQrCodeFetching(true)
    setIsQrCodeFetched(false)
    fetchQRCodeInfo({
      chainId: WORK_CHAIN_ID,
      address: qrCodeAddress,
    }).then((answer) => {
      console.log('QRCode Info', answer)
      setQrCodeInfo(answer)
      setIsQrCodeFetched(true)
      setIsQrCodeFetching(false)
    }).catch((err) => {
      setIsQrCodeFetched(false)
      setIsQrCodeFetching(false)
      console.log('err', err)
    })
  }
  
  useEffect(() => {
    setIsClaimed(false)
    setIsClaiming(false)
    updateQrCodeInfo()
  }, [ qrCodeAddress ] )
  
  useEffect(() => {
    if (isNeedUpdate) {
      setIsNeedUpdate(false)
      updateQrCodeInfo()
    }
  }, [ isNeedUpdate ])
  
  const doClaimCode_ = () => {
    doClaimByBackend()
    //doClaimFromActiveAccout()
  }

  const doClaimCode = () => {
    const debug_skipBrowser = false
    const debug_skipInjected = false
    //claimMinEnergy
    const {
      claimMinEnergy
    } = factoryStatus
    console.log('>>> claimMinEnergy', claimMinEnergy, browserAccount.balance)
    if (new BigNumber(browserAccount.balance).isGreaterThanOrEqualTo(claimMinEnergy) && !debug_skipBrowser) {
      doClaimByWeb3(false)
      console.log('claim by browser')
    } else {  
      if (new BigNumber(injectedAccount.balance).isGreaterThanOrEqualTo(claimMinEnergy) && injectedAccount.isConnected && !debug_skipInjected) {
        console.log('claim by injected')
        doClaimByWeb3(true)
      } else {
        console.log('claim by backend')
        doClaimByBackend()
      }
    }
  }
  const doClaimByBackend = () => {
    setIsClaiming(true)
    setIsClaimed(false)
    axios.get(`${BACKEND_URL}claim/${qrCodeAddress}/${claimToAddress}`)
      .then(function (response) {
        console.log(response)
        setIsClaimed(true)
        setIsClaiming(false)
      })
      .catch(function (error) {
        console.log(error)
        setIsClaimed(false)
        setIsClaiming(false)
        setIsNeedUpdate(true)
      })
      .finally(function () {
        // always executed
      })
  }
  
  const doClaimByWeb3 = (useInected = false) => {
    setIsClaiming(true)
    setIsClaimed(false)
    console.log('>>> doClaimByWeb3')
    callQRCodeMethod({
      activeWallet: (useInected) ? injectedAccount.injectedAccount : browserAccount.browserAccount,
      activeWeb3: (useInected) ? injectedAccount.injectedWeb3 : browserAccount.browserWeb3,
      contractAddress: qrCodeAddress,
      method: 'claim',
      args: [ claimToAddress ],
    }).then((answer) => {
      setIsClaimed(true)
      setIsClaiming(false)
      console.log(answer)
    }).catch((err) => {
      setIsClaimed(false)
      setIsClaiming(false)
      setIsNeedUpdate(true)
      console.log('> err', err)
    })
  }
  
  const doStartEditClaimAddress = () => {
    setOldClaimToAddress(claimToAddress)
    setIsEditClaimToAddress(true)
  }
  const doCancelEditClaimAddress = () => {
    setClaimToAddress(oldClaimToAddress)
    setIsEditClaimToAddress(false)
  }
  const doSaveClaimAddress = () => {
    setIsEditClaimToAddress(false)
  }
  console.log('>> isClaiming', isClaiming)
  return (
    <div className={styles.claimPanel}>
      <HeaderRow 
        title={PROJECT_TITLE}
        backUrl={`/`}
        gotoPage={gotoPage}
      />
      {isQrCodeFetching  && (
        <div className={`${styles.spinner} ${styles.blue}`}></div>
      )}
      {!isQrCodeFetching && !isQrCodeFetched && (
        <div className={styles.error}>Fail fetch QRCode info</div>
      )}
      {isQrCodeFetched && qrCodeInfo && (
        <>
          <Avatar address={qrCodeInfo.minter} title={`Bonus points sender`} name={qrCodeInfo.minterName} />
          {qrCodeInfo.message && (
            <div className={styles.messageBlock}>
              <span>Message from sender</span>
              <strong>{qrCodeInfo.message}</strong>
            </div>
          )}
          <div className={`${styles.claimBlock} ${(qrCodeInfo.message) ? styles.withMessage : ``}`}>
            <span className={styles.title}>Points amount</span>
            <div className={styles.pointsAmount}>
              <span>{fromWei(qrCodeInfo.amount, qrCodeInfo.decimals)}</span>
              <strong>
                {qrCodeInfo.symbol}
              </strong>
            </div>
            {isClaimed || isClaiming ? (
              <>
                {isClaimed && (
                  <>
                    <div className={styles.claimedOk}>Claimed!</div>
                    <a className={styles.claimButton} onClick={() => { gotoPage('/') }}>Go to account</a>
                  </>
                )}
                {isClaiming && (
                  <>
                    <div className={styles.spinnerHolder}>
                      <div className={`${styles.spinner} ${styles.blue}`}></div>
                    </div>
                    <a className={`${styles.claimButton} ${styles.disabled}`}>Claiming...</a>
                  </>
                )}
              </>
            ) : (
              <>
                {qrCodeInfo.isClaimed ? (
                  <>
                    <div className={styles.qrcodeExpired}>QRCode is already claimed</div>
                    <a className={styles.claimButton} onClick={() => { gotoPage('/') }}>Close</a>
                  </>
                ) : (
                  <>
                    {qrCodeInfo.isValid ? (
                      <div>
                        {/*
                        <div>Process claim</div>
                        <div>
                          {isEditClaimToAddress ? (
                            <div>
                              <h5>Edit address for claim</h5>
                              <input type="text" value={claimToAddress} onChange={(e) => { setClaimToAddress(e.target.value) }} />
                              <button onClick={doSaveClaimAddress}>Save</button>
                              <button onClick={doCancelEditClaimAddress}>Cancel</button>
                            </div>
                          ) : (
                            <>
                              <span>
                                claim to: <strong>{claimToAddress}</strong>
                              </span>
                              <button onClick={doStartEditClaimAddress}>Change address</button>
                            </>
                          )}
                        </div>
                        */}
                        {!isEditClaimToAddress && (
                          <a className={styles.claimButton} onClick={doClaimCode}>Claim bonus points</a>
                        )}
                      </div>
                    ) : (
                      <>
                        <div className={styles.qrcodeExpired}>QRCode expired</div>
                        <a className={styles.claimButton} onClick={() => { gotoPage('/') }}>Close</a>
                      </>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}
