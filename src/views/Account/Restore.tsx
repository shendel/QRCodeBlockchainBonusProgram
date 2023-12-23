
import { useEffect, useState, Component } from "react"
import { getAssets } from '@/helpers/getAssets'


import { useBrowserWeb3 } from '@/web3/BrowserWeb3Provider'


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

  const browserAccount = useBrowserWeb3()

  const [ newMnemonic, setNewMnemonic ] = useState(``)
  const [ step, setStep ] = useState(STEPS.INFO)
  
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
                <strong>{browserAccount.browserAccount}</strong>
              </div>
              <div>
                <label>Energy</label>
                <strong>0</strong>
              </div>
              <div>
                <label>Balance</label>
                <strong>0 {factoryStatus.tokenSymbol}</strong>
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
              <button onClick={() => { setStep(STEPS.SEED_INFO) }}>[Next]</button>
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
              
            </div>
            <div>
              <button onClick={() => { setStep(STEPS.SEED_INFO) }}>[Back]</button>
              <button onClick={() => { setStep(STEPS.READY) }}>[Confirm]</button>
            </div>
          </div>
        )}
        {step == STEPS.READY && (
          <div>
            <div>Ready</div>
            <div>
              <button>[Ready]</button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
