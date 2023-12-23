import getConfig from 'next/config'

import { useEffect, useState, Component } from "react"
import { getAssets } from '@/helpers/getAssets'
import { useAccount } from 'wagmi'

import { QRCODE_ROLES, checkRole } from '@/qrcode_helpers/checkRole'

import fetchQRCodeInfo from '@/qrcode_helpers/fetchQRCodeInfo'
import callQRCoreMethod from '@/qrcode_helpers/callQRCoreMethod'

import { QRCODE_FACTORY, WORK_CHAIN_ID } from '@/config'
import { useBrowserWeb3 } from '@/web3/BrowserWeb3Provider'
import { useInjectedWeb3 } from '@/web3/InjectedWeb3Provider'

import { fromWei, toWei } from '@/helpers/wei'
import axios from 'axios'
import BigNumber from "bignumber.js"


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

  
  const account = useAccount()

  const [ isQrCodeFetching, setIsQrCodeFetching ] = useState(true)
  const [ isQrCodeFetched, setIsQrCodeFetched ] = useState(false)
  const [ qrCodeInfo, setQrCodeInfo ] = useState(false)
  
  const [ claimToAddress, setClaimToAddress ] = useState((isExternalWalletConnected) ? connectedWallet : browserAccount)
  const [ oldClaimToAddress, setOldClaimToAddress ] = useState((isExternalWalletConnected) ? connectedWallet: browserAccount)
  const [ isEditClaimToAddress, setIsEditClaimToAddress ] = useState(false)

  const [ isClaiming, setIsClaiming ] = useState(false)
  const [ isClaimed, setIsClaimed ] = useState(false)
  const [ isNeedUpdate, setIsNeedUpdate ] = useState(false)

  const injectedAccount = useInjectedWeb3()
  const browserAccount = useBrowserWeb3()


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
    callQRCoreMethod({
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
  return (
    <>
      {isQrCodeFetching && (
        <div>Loading...</div>
      )}
      {!isQrCodeFetching && !isQrCodeFetched && (
        <div>Fail fetch QRCode info</div>
      )}
      {isQrCodeFetched && qrCodeInfo && (
        <>
          <div>QRCODE: { qrCodeAddress}</div>
          <div>
            <strong>{qrCodeInfo.minterName}</strong>
          </div>
          <div>
            <em>{qrCodeInfo.message}</em>
          </div>
          <div>
            <span>{fromWei(qrCodeInfo.amount, qrCodeInfo.decimal)}</span>
            <strong>
              {qrCodeInfo.symbol}
            </strong>
          </div>
          {isClaimed || isClaiming ? (
            <>
              {isClaimed && (
                <div>Successfull claimed</div>
              )}
              {isClaiming && (
                <div>
                  Claiming
                </div>
              )}
            </>
          ) : (
            <>
              {qrCodeInfo.isClaimed ? (
                <div>QRCode is already claimed</div>
              ) : (
                <>
                  {qrCodeInfo.isValid ? (
                    <div>
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
                      {!isEditClaimToAddress && (
                        <button onClick={doClaimCode}>Claim</button>
                      )}
                    </div>
                  ) : (
                    <div>QRCode expired</div>
                  )}
                </>
              )}
            </>
          )}
        </>
      )}
    </>
  )
}
