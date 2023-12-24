
import { useEffect, useState, Component } from "react"
import { getAssets } from '@/helpers/getAssets'


import { useBrowserWeb3 } from '@/web3/BrowserWeb3Provider'

import fetchBalance from '@/helpers/fetchBalance'
import fetchTokenBalance from '@/helpers/fetchTokenBalance'
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

  const fetchWalletStatus = (address) => {
    return new Promise((resolve, reject) => {
      fetchBalance({
        address,
        chainId: WORK_CHAIN_ID
      }).then((balance) => {
        fetchTokenBalance({
          wallet: address,
          chainId: WORK_CHAIN_ID,
          tokenAddress: factoryStatus.tokenAddress,
        }).then((answer) => {
          resolve({
            address,
            energy: balance,
            balance: answer.wei
          })
        }).catch((err) => {
          console.log('>> err', err)
          reject(err)
        })
      }).catch((err) => {
        console.log('>> err', err)
        reject(err)
      })
    })
  }

  useEffect(() => {
    if (browserAccount && factoryStatus) {
      setIsCurrentBalanceFetching(true)
      setIsCurrentBalanceError(false)
      fetchWalletStatus(
        browserAccount
      ).then(({ energy, balance }) => {
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
      fetchWalletStatus(
        address
      ).then(({ energy, balance }) => {
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
      <div>
        <header>
          <span>Info</span>
          <em>&gt;</em>
          <span>New seed</span>
          <em>&gt;</em>
        </header>
        {step == STEPS.INFO && (
          <div>
            <div>
              <div>
                <label>You currenct address:</label>
                <strong>{browserAccount}</strong>
              </div>
              <div>
                <label>Energy</label>
                <strong>{fromWei(currentEnergy)}</strong>
              </div>
              <div>
                <label>Balance</label>
                <strong>{fromWei(currentBalance, factoryStatus.tokenDecimals)} {factoryStatus.tokenSymbol}</strong>
              </div>
            </div>
            <div>
              <button onClick={() => { setStep(STEPS.FORM) }}>[Enter new seed]</button>
              <button onClick={() => { }}>[CANCEL]</button>
            </div>
          </div>
        )}
        {step == STEPS.FORM && (
          <div>
            <div>
              <div>
                <label>New seed</label>
                <input type="text" value={newMnemonic} onChange={(e) => { setNewMnemonic(e.target.value) }} />
              </div>
            </div>
            <div>
              <button onClick={() => { setStep(STEPS.INFO) }}>[Back]</button>
              <button onClick={() => { goToStepSeedInfo() }}>[Next]</button>
            </div>
          </div>
        )}
        {step == STEPS.SEED_INFO && (
          <div>
            <div>
              <div>
                <label>New seed</label>
                <strong>{newMnemonic}</strong>
              </div>
              <div>
                <label>Address:</label>
                <strong>{newAddress}</strong>
              </div>
              <div>
                <label>Energy</label>
                <strong>{fromWei(newEnergy)}</strong>
              </div>
              <div>
                <label>Balance</label>
                <strong>{fromWei(newBalance, factoryStatus.tokenDecimals)} {factoryStatus.tokenSymbol}</strong>
              </div>
            </div>
            <div>
              <button onClick={() => { setStep(STEPS.FORM) }}>[Back]</button>
              <button onClick={() => { setStep(STEPS.CONFIRM) }}>[Use this seed]</button>
            </div>
          </div>
        )}
        {step == STEPS.CONFIRM && (
          <div>
            <div>
              <div><span>New wallet</span></div>
              <div><strong>{newAddress}</strong></div>
              <div>Are you realy want switch to this account?</div>
            </div>
            <div>
              <button onClick={() => { setStep(STEPS.SEED_INFO) }}>[Back]</button>
              <button onClick={() => { doSwitchAccount() }}>[Confirm]</button>
            </div>
          </div>
        )}
        {step == STEPS.READY && (
          <div>
            <div>Ready</div>
            <div>
              <button onClick={() => { gotoPage('/account') }}>[Ready]</button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
