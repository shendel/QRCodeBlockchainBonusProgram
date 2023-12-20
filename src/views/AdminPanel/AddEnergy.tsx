
import { useEffect, useState, Component } from "react"
import { getAssets } from '@/helpers/getAssets'
import { useAccount } from 'wagmi'

import { translate as t } from '@/translate'

import fetchBalance from '@/helpers/fetchBalance'
import { WORK_CHAIN_ID, BACKEND_CLAIMER } from '@/config'
import { toWei, fromWei } from '@/helpers/wei'
import BigNumber from "bignumber.js"
import sendEther from '@/web3/sendEther'


export default function AdminPanelAddEnergy(props) {
  const {
    gotoPage,
    params: {
      target
    },
    render404,
    factoryStatus,
    UpdateFactoryStatus
  } = props
  
  const TARGET_ADDRESS = {
    factory: factoryStatus.address,
    claimer: BACKEND_CLAIMER,
  }
  const TARGET_NAME = {
    factory: `QRFactory`,
    claimer: `BackEnd Claimer`
  }
  
  if (!TARGET_ADDRESS[target]) {
    return render404()
  }

  const { address: connectedWallet } = useAccount()
  const account = useAccount()
  
  const [ isEnergyAdded, setIsEnergyAdded ] = useState(false)
  const [ connectedWalletBalance, setConnectedWalletBalance ] = useState(0)
  const [ isBalanceFetching, setIsBalanceFetching ] = useState(true)
  const [ isBalanceFetchingError, setIsBalanceFetchingError ] = useState(false)

  useEffect(() => {
    setIsBalanceFetching(true)
    setIsBalanceFetchingError(false)
    fetchBalance({
      address: connectedWallet,
      chainId: WORK_CHAIN_ID,
    }).then((balance) => {
      setConnectedWalletBalance(balance)
      setIsBalanceFetching(false)
      setIsBalanceFetchingError(false)
    }).catch((err) => {
      setIsBalanceFetchingError(true)
      setIsBalanceFetching(false)
      console.log('>> err', err)
    })
  }, [ connectedWallet ])

  const [ newEnergyAmount, setNewEnergyAmount ] = useState(0)
  const [ newErengyAmountError, setNewEnergyAmountError ] = useState(``)
  
  const [ currenctEnergy, setCurrentEnergy ] = useState(0)
  const [ isEnergyFetching, setIsEnergyFetching ] = useState(true)
  const [ isEnergyFetched, setIsEnergyFetched ] = useState(false)
  const [ isEnergyFetchingError, setIsEnergyFetchingError ] = useState(false)
  const [ isEnergySending, setIsEnergySending ] = useState(false)

  useEffect(() => {
    if (TARGET_ADDRESS[target]) {
      setIsEnergyFetching(true)
      setIsEnergyFetchingError(false)
      fetchBalance({
        address: TARGET_ADDRESS[target],
        chainId: WORK_CHAIN_ID,
      }).then((balance) => {
        console.log('>>> ', target, balance)
        setCurrentEnergy(balance)
        setIsEnergyFetching(false)
        setIsEnergyFetched(true)
      }).catch((err) => {
        setIsEnergyFetchingError(true)
        setIsEnergyFetching(false)
      })
    }
  }, [ target ])

  useEffect(() => {
    setNewEnergyAmountError(``)
  }, [ newEnergyAmount ])
  
  const doAddEnergy = () => {
    const amountInWei = toWei(newEnergyAmount)
    
    if (new BigNumber(amountInWei).isLessThanOrEqualTo(0)) {
      return setNewEnergyAmountError(t('Amount must be greater than zero'))
    }
    if (new BigNumber(amountInWei).isGreaterThan(connectedWalletBalance)) {
      return setNewEnergyAmountError(t('Amount is greater than your aviable balance'))
    }
    
    setIsEnergySending(true)
    sendEther({
      account,
      to: TARGET_ADDRESS[target],
      weiAmount: amountInWei
    }).then((answer) => {
      console.log('>> answer', answer)
      setIsEnergyAdded(true)
      setIsEnergySending(false)
      UpdateFactoryStatus()
    }).catch((err) => {
      setIsEnergySending(false)
      console.log('>> err', err)
    })
  }

  const readyForSubmit = (!isBalanceFetching && !isBalanceFetchingError && !isEnergyFetching && !isEnergyFetchingError)
  return (
    <>
      <h3>AdminPanel - Add energy</h3>
      <nav>
        <a href="#/admin/">[Back]</a>
      </nav>
      <div>
        {!isEnergyAdded ? (
          <>
            <div className="adminForm">
              <header>{t('Add energy to {name} contract', { name: TARGET_NAME[target] })}</header>
              <div className="inputHolder">
                <label>{t('Energy on {name} contract', { name: TARGET_NAME[target] } )}</label>
                <div className={`infoRow ${(isEnergyFetchingError) ? 'hasError' : ''}`}>
                  {isEnergyFetchingError ? (
                    <>{t('Fail fetch energy at {name}', { name: TARGET_NAME[target] })}</>
                  ) : (
                    <>
                      {isEnergyFetching ? t('Fetching balance') :fromWei(currenctEnergy)}
                    </>
                  )}
                </div>
              </div>
              <div className="inputHolder">
                <label>{t('Your aviabled energy')}</label>
                <div className={`infoRow ${(isBalanceFetchingError) ? 'hasError' : ''}`}>
                  {isBalanceFetchingError ? (
                    <>
                      {t('Fail fetch active account balance')}
                    </>
                  ) : (
                    <>
                      {isBalanceFetching ? t('Fetching balance') :fromWei(connectedWalletBalance)}
                    </>
                  )}
                </div>
              </div>
              <div className="inputHolder">
                <label className="required">{t('Energy amount')}</label>
                <input type="number" 
                  value={newEnergyAmount}
                  className={(newErengyAmountError !== ``) ? 'hasError' : ''}
                  onChange={(e) => { setNewEnergyAmount(e.target.value) }}
                />
                {newErengyAmountError != `` && (
                  <div className="error">{newErengyAmountError}</div>
                )}
              </div>
              <div className="buttonsHolder">
                <button
                  onClick={doAddEnergy}
                  disabled={!readyForSubmit || isEnergySending}
                >
                  {(isEnergySending)
                    ? t('Adding energy')
                    : t('Add energy')
                  }
                </button>
                <button disabled={isEnergySending} onClick={() => { gotoPage('/admin/') }} className="isCancel">{t('Cancel')}</button>
              </div>
            </div>
          </>
        ) : (
          <div className="adminForm">
            <header>{t('Add energy to {name} contract', { name: TARGET_NAME[target] })}</header>
            <div className="inputHolder">
              <strong>{newEnergyAmount}</strong>
              {` `}
              {t('Energy successfull added')}
            </div>
            <div className="buttonsHolder">
              <button onClick={() => { gotoPage('/admin/') }} className="isGreen">
                {t('Go back')}
              </button>
            </div>
          </div>
        )}
        
      </div>
    </>
  )
}
