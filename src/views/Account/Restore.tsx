
import { useEffect, useState, Component } from "react"
import { getAssets } from '@/helpers/getAssets'


import { useBrowserWeb3 } from '@/web3/BrowserWeb3Provider'

import fetchWalletStatus from '@/qrcode_helpers/fetchWalletStatus'

import { fromWei } from '@/helpers/wei'

import { WORK_CHAIN_ID } from '@/config'
import { mnemonicIsValid, getEthLikeWallet } from '@/web3/mnemonic'

export default function AccountRestore(props) {
  const {
    gotoPage,
    factoryStatus
  } = props
  
  const STEPS = {
    INFO:       `INFO`,
    FORM:       `FORM`,
    SEED_INFO:  `SEED_INFO`,
    CONFIRM:    `CONFIRM`,
    READY:      `READY`,
  }

  const {
    browserAccount,
    switchAccount,
  } = useBrowserWeb3()

  const [ newMnemonic, setNewMnemonic ] = useState(``)
  const [ step, setStep ] = useState(STEPS.INFO)

  const [ currentEnergy, setCurrentEnergy ] = useState(0)
  const [ currentBalance, setCurrentBalance ] = useState(0)
  const [ isCurrentBalanceFetching, setIsCurrentBalanceFetching ] = useState(true)
  const [ isCurrentBalanceFetched, setIsCurrentBalanceFetched ] = useState(false)
  const [ isCurrentBalanceError, setIsCurrentBalanceError ] = useState(false)


  useEffect(() => {
    if (browserAccount && factoryStatus) {
      setIsCurrentBalanceFetching(true)
      setIsCurrentBalanceError(false)
      fetchWalletStatus({
        address: browserAccount,
        chainId: WORK_CHAIN_ID,
        tokenAddress: factoryStatus.tokenAddress,
      }).then(({ energy, balance }) => {
        setCurrentEnergy(energy)
        setCurrentBalance(balance)
        setIsCurrentBalanceFetched(true)
        setIsCurrentBalanceFetching(false)
      }).catch((err) => {
        console.log('>> err', err)
        setIsCurrentBalanceError(true)
        setIsCurrentBalanceFetching(false)
      })
    }
  }, [ factoryStatus, browserAccount ])

  const [ newAddress, setNewAddress ] = useState(``)
  const [ newEnergy, setNewEnergy ] = useState(0)
  const [ newBalance, setNewBalance ] = useState(0)
  const [ isNewBalanceFetched, setIsNewBalanceFetched ] = useState(false)
  const [ isNewBalanceFetching, setIsNewBalanceFetching ] = useState(false)
  const [ isNewBalanceError, setIsNewBalanceError ] = useState(false)
  
  const goToStepSeedInfo = () => {
    if (mnemonicIsValid(newMnemonic)) {
      const newWalletInfo = getEthLikeWallet({ mnemonic: newMnemonic })
      console.log('>>> newWalletInfo', newWalletInfo)
      const {
        address
      } = newWalletInfo
      setNewAddress(address)
      setIsNewBalanceError(false)
      setIsNewBalanceFetching(true)
      fetchWalletStatus({
        address,
        chainId: WORK_CHAIN_ID,
        tokenAddress: factoryStatus.tokenAddress,
      }).then(({ energy, balance }) => {
        setNewEnergy(energy)
        setNewBalance(balance)
        setIsNewBalanceFetched(true)
        setIsNewBalanceFetching(false)
        setStep(STEPS.SEED_INFO)
      }).catch((err) => {
        console.log('>> err', err)
        setIsNewBalanceError(true)
        setIsNewBalanceFetching(false)
      })
    }
  }
  
  const doSwitchAccount = () => {
    if (switchAccount(newMnemonic)) {
      setStep(STEPS.READY)
    }
  }

  const isLoading = isCurrentBalanceFetching

  return (
    <>
      <h1>Account page - restore</h1>
      <div className="adminForm">
        <header>Restore account</header>
        {step == STEPS.INFO && (
          <>
            <div className="inputHolder">
              <label>You currenct address:</label>
              <div className="infoRow">
                <strong>{browserAccount}</strong>
              </div>
            </div>
            <div className="inputHolder">
              <label>Energy</label>
              <div className="infoRow">
                <strong>{fromWei(currentEnergy)}</strong>
              </div>
            </div>
            <div className="inputHolder">
              <label>Balance</label>
              <div className="infoRow">
                <strong>{fromWei(currentBalance, factoryStatus.tokenDecimals)} {factoryStatus.tokenSymbol}</strong>
              </div>
            </div>
            <div className="buttonsHolder">
              <button onClick={() => { gotoPage('/account/')}} className="isCancel">Cancel</button>
              <button onClick={() => { setStep(STEPS.FORM) }}>Enter new seed</button>
            </div>
          </>
        )}
        {step == STEPS.FORM && (
          <>
            <div className="inputHolder">
              <label className="required">New seed</label>
              <textarea value={newMnemonic} onChange={(e) => { setNewMnemonic(e.target.value) }} />
            </div>
            <div className="buttonsHolder">
              <button onClick={() => { setStep(STEPS.INFO) }} className="isCancel">Back</button>
              <button onClick={() => { goToStepSeedInfo() }}>Next</button>
            </div>
          </>
        )}
        {step == STEPS.SEED_INFO && (
          <>
            <div className="inputHolder">
              <label>New seed</label>
              <div className="infoRow">
                <strong>{newMnemonic}</strong>
              </div>
            </div>
            <div className="inputHolder">
              <label>Address:</label>
              <div className="infoRow">
                <strong>{newAddress}</strong>
              </div>
            </div>
            <div className="inputHolder">
              <label>Energy</label>
              <div className="infoRow">
                <strong>{fromWei(newEnergy)}</strong>
              </div>
            </div>
            <div className="inputHolder">
              <label>Balance</label>
              <div className="infoRow">
                <strong>{fromWei(newBalance, factoryStatus.tokenDecimals)} {factoryStatus.tokenSymbol}</strong>
              </div>
            </div>
            <div className="buttonsHolder">
              <button onClick={() => { setStep(STEPS.FORM) }} className="isCancel">Back</button>
              <button onClick={() => { setStep(STEPS.CONFIRM) }}>Use this seed</button>
            </div>
          </>
        )}
        {step == STEPS.CONFIRM && (
          <>
            <div className="inputHolder">
              <label>New wallet</label>
              <div className="infoRow">
                <strong>{newAddress}</strong>
              </div>
            </div>
            <div className="greenInfoBox">
              Are you realy want switch to this account?
            </div>
            <div className="buttonsHolder">
              <button onClick={() => { setStep(STEPS.SEED_INFO) }} className="isCancel">Back</button>
              <button onClick={() => { doSwitchAccount() }}>Confirm</button>
            </div>
          </>
        )}
        {step == STEPS.READY && (
          <>
            <div className="greenInfoBox">
              Account switched to {newAddress}
            </div>
            <div className="buttonsHolder">
              <button onClick={() => { gotoPage('/account') }} className="isGreen">Ok, go back to account page</button>
            </div>
          </>
        )}
      </div>
    </>
  )
}
