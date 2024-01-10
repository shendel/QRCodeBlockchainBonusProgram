
import { useEffect, useState, Component } from "react"
import { getAssets } from '@/helpers/getAssets'

import fetchWalletStatus from '@/qrcode_helpers/fetchWalletStatus'

import { useBrowserWeb3 } from '@/web3/BrowserWeb3Provider'
import { translate as t } from '@/translate'

import { toWei, fromWei } from '@/helpers/wei'
import fetchTokenAllowance from '@/helpers/fetchTokenAllowance'
import approveToken from '@/helpers/approveToken'

import callBridgeMethod from '@/qrcode_helpers/callBridgeMethod'
import fetchBridgeSwapInfo from '@/qrcode_helpers/fetchBridgeSwapInfo'


import { BigNumber } from 'bignumber.js'

import {
  WORK_CHAIN_ID,
  BRIDGE_WORK_CONTRACT
} from '@/config'

export default function Bridge(props) {
  const {
    gotoPage,
    factoryStatus,
    backendStatus: {
      bridge_qrcode_tokenDecimals,
      bridge_qrcode_tokenSymbol,
      
      bridge_mainnet_tokenSymbol,
    }
  } = props

  const STEPS = {
    BEGIN: 'BEGIN',
    CONFIRM: 'CONFIRM',
    WAIT: 'WAIT',
    READY: 'READY'
  }

  const [ energy, setEnergy ] = useState(0)
  const [ balance, setBalance ] = useState(0)
  const [ isBalanceFetching, setIsBalanceFetching ] = useState(true)

  const [ tokenDecimals, setTokenDecimals ] = useState(0)
  const [ tokenSymbol, setTokenSymbol ] = useState(``)

  const [ formStep, setFormStep ] = useState(STEPS.BEGIN)

  const {
    browserAccount,
    browserWeb3
  } = useBrowserWeb3()
  const [ isLoading, setIsLoading ] = useState(false)

  const [ bridgeAmount, setBridgeAmount ] = useState(0)
  const [ bridgeAmountError, setBridgeAmountError ] = useState(``)

  const [ destinationAddress, setDestinationAddress ] = useState(browserAccount)
  
  const [ isAllowanceFetching, setIsAllowanceFetching ] = useState(false)
  const [ allowance, setAllowance ] = useState(0)

  useEffect(() => {
    if (browserAccount) {
      setIsBalanceFetching(true)
      fetchWalletStatus({
        address: browserAccount,
        chainId: WORK_CHAIN_ID,
        tokenAddress: factoryStatus.tokenAddress,
      }).then(({ energy, balance, tokenDecimals, tokenSymbol }) => {
        setBalance(balance)
        setEnergy(energy)
        setIsBalanceFetching(false)
        setTokenDecimals(tokenDecimals)
        setTokenSymbol(tokenSymbol)
      }).catch((err) => {
        console.log(err)
      })
      setIsAllowanceFetching(true)
      fetchTokenAllowance({
        from: browserAccount,
        to: BRIDGE_WORK_CONTRACT,
        chainId: WORK_CHAIN_ID,
        tokenAddress: factoryStatus.tokenAddress,
      }).then(({ allowance }) => {
        setAllowance(allowance)
        setIsAllowanceFetching(false)
      }).catch((err) => {
        console.log('>>> err', err)
      })
    }
  }, [ browserAccount ])
  
  const gotoConfirm = () => {
    
    setFormStep(STEPS.CONFIRM)
  }

  const [ isSendToBridge, setIsSendToBridge ] = useState(false)
  const [ swapId, setSwapId ] = useState(0)
  
  const doBridge = async () => {
    setIsLoading(true)
    const weiAmount = toWei(bridgeAmount, tokenDecimals)
    if (new BigNumber(weiAmount).isGreaterThan(allowance)) {
      try {
        await approveToken({
          activeWallet: browserAccount,
          activeWeb3: browserWeb3,
          tokenAddress: factoryStatus.tokenAddress,
          approveFor: BRIDGE_WORK_CONTRACT,
          weiAmount: `0x` + new BigNumber(weiAmount).toString(16)
        })
      } catch (err) {
        console.log('Fail approve', err)
        setIsLoading(false)
        return
      }
    }
    callBridgeMethod({
      activeWallet: browserAccount,
      activeWeb3: browserWeb3,
      contractAddress: BRIDGE_WORK_CONTRACT,
      method: 'swapOut',
      args: [
        destinationAddress,
        `0x` + new BigNumber(toWei(bridgeAmount, tokenDecimals)).toString(16)
      ],
    }).then((answer) => {
      console.log('>>> bridge answer', answer)
      if (answer?.events?.onSwapOut?.returnValues?.swapId) {
        console.log('>>> swapId', answer?.events?.onSwapOut?.returnValues?.swapId)
        setSwapId(answer?.events?.onSwapOut?.returnValues?.swapId)
        setFormStep(STEPS.WAIT)
        setIsLoading(false)
      }
    }).catch((err) => {
      setIsLoading(false)
      console.log(err)
    })
  }

  useEffect(() => {
    if (swapId) {
      console.log('>>> waitSwap ', swapId)
    }
  }, [ swapId ])
  
  const loopSwapStatus = () => {
    fetchBridgeSwapInfo({
      address: BRIDGE_WORK_CONTRACT,
      chainId: WORK_CHAIN_ID,
      swapId
    }).then(({ info }) => {
      const { swapped , inHash } = info
      console.log('>>. swap status', info)
      if (swapped) {
        setFormStep(STEPS.READY)
      }
    }).catch((err) => {
      console.log('err', err)
    })
  }
  const doFetchSwapStatus = () => {
    console.log('>>> update swap status')
    loopSwapStatus()
  }
  
  const _isLoading = isLoading || isAllowanceFetching
  return (
    <>
      <div className={`adminForm ${(_isLoading) ? 'isLoading' : ''}`}>
        <header>{t('Bridge tokens to mainnet')}</header>
        {formStep == STEPS.BEGIN && (
          <>
            <div className="inputHolder">
              <label className="required">
                {t(
                  'Amount (Aviable {balance} {symbol})',
                  {
                    balance: fromWei(balance, tokenDecimals),
                    symbol: tokenSymbol
                  }
                )}
              </label>
              <div className="inputWithButtons">
                <input type="number" 
                  value={bridgeAmount}
                  className={(bridgeAmountError !== ``) ? 'hasError' : ''}
                  onChange={(e) => { setBridgeAmount(e.target.value) }}
                />
                <button onClick={() => {
                  setBridgeAmount(fromWei(balance, tokenDecimals))
                }}>
                  {t('Max')}
                </button>
              </div>
              {bridgeAmountError != `` && (
                <div className="error">{bridgeAmountError}</div>
              )}
            </div>
            <div className="inputHolder">
              <label className="required">{t('Destination address')}</label>
              <div className="inputWithButtons">
                <input type="text"
                  value={destinationAddress}
                  onChange={(e) => { setDestinationAddress(e.target.value) }}
                />
              </div>
            </div>
            <div className="buttonsHolder">
              <button onClick={() => { gotoPage('/account/') }} className="isCancel">{t('Cancel')}</button>
              <button
                onClick={gotoConfirm}
              >
                {t('Next')}
              </button>
            </div>
          </>
        )}
        {formStep == STEPS.CONFIRM && (
          <>
            <div className="greenInfoBox">
              {t('Bridge tokens?')}
            </div>
            <div className="buttonsHolder">
              <button onClick={() => { setFormStep(STEPS.BEGIN) }} className="isCancel">{t('Back')}</button>
              <button
                onClick={doBridge}
              >
                {t('Next')}
              </button>
            </div>
          </>
        )}
        {formStep == STEPS.WAIT && (
          <>
            <div className="greenInfoBox">
              {t('Sended to bridge. Swap #{swapId}', { swapId })}
            </div>
            <div className="buttonsHolder">
              <button onClick={doFetchSwapStatus}>Update status</button>
            </div>
          </>
        )}
        {formStep == STEPS.READY && (
          <>
            <div className="greenInfoBox">
              {t('Tokens succefully bridged to mainnet')}
            </div>
            <div className="buttonsHolder">
              <button onClick={() => { gotoPage('/account/') }} className="isGreen">{t('Ok')}</button>
            </div>
          </>
        )}
      </div>
    </>
  )
}
