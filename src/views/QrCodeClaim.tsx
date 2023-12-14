
import { useEffect, useState, Component } from "react"
import { getAssets } from '@/helpers/getAssets'
import { useAccount } from 'wagmi'

import { QRCODE_ROLES, checkRole } from '@/qrcode_helpers/checkRole'

import fetchQRCodeInfo from '@/qrcode_helpers/fetchQRCodeInfo'
import callQRCoreMethod from '@/qrcode_helpers/callQRCoreMethod'

import { QRCODE_FACTORY, WORK_CHAIN_ID } from '@/config'

import { fromWei } from '@/helpers/wei'

export default function QrCodeClaim(props) {
  const {
    gotoPage,
    factoryStatus,
    params: {
      qrCodeAddress
    }
  } = props
  
  const { address: connectedWallet } = useAccount()
  const account = useAccount()

  const [ isQrCodeFetching, setIsQrCodeFetching ] = useState(true)
  const [ isQrCodeFetched, setIsQrCodeFetched ] = useState(false)
  const [ qrCodeInfo, setQrCodeInfo ] = useState(false)
  
  const [ claimToAddress, setClaimToAddress ] = useState(connectedWallet)
  const [ oldClaimToAddress, setOldClaimToAddress ] = useState(connectedWallet)
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
  
  const doClaimCode = () => {
    doClaimFromActiveAccout()
  }
  
  const doClaimFromActiveAccout = () => {
    setIsClaiming(true)
    setIsClaimed(false)
    callQRCoreMethod({
      account,
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
  const doClaimViaBackend = () => {
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
