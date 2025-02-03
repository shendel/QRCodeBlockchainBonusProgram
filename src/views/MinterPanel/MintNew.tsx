
import { useEffect, useState, Component } from "react"
import { getAssets } from '@/helpers/getAssets'
import { useAccount } from 'wagmi'

import WorkChainHolder from '@/components/qrcode/WorkChainHolder'

import callQRFactoryMethod from '@/qrcode_helpers/callQRFactoryMethod'
import {
  PROJECT_TITLE,
  QRCODE_FACTORY,
  MINT_PRESET_AMMOUNT,
  MINT_PRESET_EXPIRE,
  MINT_MIN_BROWSER_ENERGY,
  WORK_CHAIN_ID
} from '@/config'

import HeaderRow from '@/components/qrcode/HeaderRow/'
import LoaderFullScreen from '@/components/qrcode/LoaderFullScreen'
import Title from '@/components/qrcode/Title'

import { toWei, fromWei } from '@/helpers/wei'
import { getTranslate } from '@/translate'
import BigNumber from "bignumber.js"

import { useBrowserWeb3 } from '@/web3/BrowserWeb3Provider'
import { useInjectedWeb3 } from '@/web3/InjectedWeb3Provider'
import { useAlertModal } from '@/components/qrcode/AlertModal'

import fetchBalance from '@/helpers/fetchBalance'
const t = getTranslate('MINT_PAGE')

import styles from './MintNew.module.scss'

export default function MinterMintNew(props) {
  const {
    gotoPage,
    factoryStatus,
  } = props
  
  const { openModal: openAlertModal } = useAlertModal()
  const { address: connectedWallet } = useAccount()
  const account = useAccount()

  const {
    browserWeb3,
    browserAccount,
  } = useBrowserWeb3()
  
  const {
    injectedWeb3,
    injectedAccount,
  } = useInjectedWeb3()

  const [ amount, setAmount ] = useState(0)
  const [ amountError, setAmountError ] = useState(``)
  
  const [ message, setMessage ] = useState(``)
  const [ timelife, setTimelife ] = useState(0)

  const [ browserEnergy, setBrowserEnergy ] = useState(0)
  const [ isBrowserEnergyFetched, setIsBrowserEnergyFetched ] = useState(false)
  const [ isBrowserEnergyFetching, setIsBrowserEnergyFetching ] = useState(true)

  useEffect(() => {
    setIsBrowserEnergyFetched(false)
    setIsBrowserEnergyFetching(true)
    fetchBalance({
      address: browserAccount,
      chainId: WORK_CHAIN_ID,
    }).then((balance) => {
      setBrowserEnergy(balance)
      setIsBrowserEnergyFetched(true)
      setIsBrowserEnergyFetching(false)
      console.log('>>> balance', balance)
    }).catch((err) => {
      setIsBrowserEnergyFetched(false)
      setIsBrowserEnergyFetching(false)
      console.log('>> err', err)
    })
  }, [ browserAccount ])

  useEffect(() => {
    setAmountError(``)
  }, [ amount ])

  const [ isMinting, setIsMinting ] = useState(false)
  
  const doMintQrCode = () => {
    if (!amount || new BigNumber(amount).isLessThanOrEqualTo(0)) {
      openAlertModal({
        title: t('Error'),
        message: t('Amount must be greater than zero'),
      })
      return
    }
    setIsMinting(true)

    const useBrowser = (new BigNumber(browserEnergy).isGreaterThanOrEqualTo(toWei(MINT_MIN_BROWSER_ENERGY))) ? true : false
    callQRFactoryMethod({
      activeWallet: (useBrowser) ? browserAccount : injectedAccount,
      activeWeb3: (useBrowser) ? browserWeb3 : injectedWeb3,
      web3: (new BigNumber(browserEnergy).isGreaterThanOrEqualTo(toWei(MINT_MIN_BROWSER_ENERGY))) ? browserWeb3 : false,
      contractAddress: QRCODE_FACTORY,
      method: 'mint',
      args: [
        toWei(amount, factoryStatus.tokenDecimals),
        timelife,
        message,
      ]
    }).then((answer) => {
      console.log(answer)
      if (answer
        && answer.events
        && answer.events.QrCodeMinted
      ) {
        const qrCodeAddress = answer.events.QrCodeMinted.returnValues.qrcode
        gotoPage(`/qrcodeview/${qrCodeAddress}`)
      }
    }).catch((err) => {
      
      console.log('>>>', err)
    })
  }

  const TABS = {
    NEW_CODE: 'NEW_CODE',
    TEMPLATES: 'TEMPLATES',
  }
  const [ templates, setTemplates ] = useState([])
  
  const [ activeTab, setActiveTab ] = useState(TABS.NEW_CODE)
  
  return (
    <WorkChainHolder>
      <div className={styles.mintQrCodePanel}>
        <HeaderRow title={PROJECT_TITLE} backUrl={`/minter`} gotoPage={gotoPage} />
        {(isMinting) && (<LoaderFullScreen />)}
        <Title title={t('Minting QRCode')} />
        <div className={styles.templateSource}>
          <a className={(activeTab == TABS.NEW_CODE) ? styles.active : ''} onClick={() => { setActiveTab(TABS.NEW_CODE) }}>
            {t('New QRCode')}
          </a>
          <a className={(activeTab == TABS.TEMPLATES) ? styles.active : ''} onClick={() => { setActiveTab(TABS.TEMPLATES) }}>
            {t('From Template')}
          </a>
        </div>
        {activeTab == TABS.TEMPLATES && (
          <>
            <div className={styles.templatesHolder}>
              <strong className={styles.emptyList}>
                {t('You do not have any templates. Create a new one.')}
              </strong>
              <a className={styles.createNew} onClick={() => { setActiveTab(TABS.NEW_CODE) }}>
                {t('Create a New Template for Minting QR Codes')}
              </a>
              <div className={styles.templates}>
                <div>
                  <div>
                    <label>Amount: 1 BonusPoint</label>
                    <span>Valid during 5 minutes</span>
                    <div>Without message</div>
                  </div>
                  <div>
                    <a>Use</a>
                    <a>Change</a>
                    <a>Remove</a>
                  </div>
                </div>
                <div>
                  <div>
                    <label>Amount: 1 BonusPoint</label>
                    <span>Valid during 5 minutes</span>
                    <div>Without message</div>
                  </div>
                  <div>
                    <a>Use</a>
                    <a>Change</a>
                    <a>Remove</a>
                  </div>
                </div>
              </div>
              
            </div>
          </>
        )}
        {activeTab == TABS.NEW_CODE && (
          <>
            <div className={styles.formHolder}>
              <div className={styles.inputHolder}>
                <label>{t('Energy')}</label>
                <div className={styles.infoRow}>{fromWei(browserEnergy)}</div>
              </div>
              <div className={styles.inputHolder}>
                <label className={styles.required}>
                  {t('Amount')}
                </label>
                <div className={styles.inputRow}>
                  <input
                    type="number"
                    min={0}
                    value={amount}
                    onChange={(e) => { setAmount(e.target.value) }}
                  />
                  <em></em>
                  <strong>{factoryStatus.tokenSymbol}</strong>
                </div>
                {amountError != `` && (
                  <div className={styles.error}>{amountError}</div>
                )}
                <style>
                {`
                  .tokensAmountPresset {
                    padding-left: 1em;
                    padding-right: 1em;
                    padding-top: 0.25em;
                  }
                  .tokensAmountPresset SPAN {
                    font-size: 12pt;
                  }
                  .tokensAmountPresset A {
                    font-weight: bold;
                    cursor: pointer;
                    font-size: 12pt;
                  }
                  .tokensAmountPresset A::after {
                    content: "|";
                    padding-left: 0.25em;
                    padding-right: 0.25em;
                    font-size: 12pt;
                  }
                `}
                </style>
                <div className="tokensAmountPresset">
                  <span>{t('Predefined Values:')}</span>
                  {MINT_PRESET_AMMOUNT.map((amount, index) => {
                    return (
                      <a key={index} onClick={() => { setAmount(amount) }}>[{amount}]</a>
                    )
                  })}
                </div>
                
              </div>
              <div className={styles.inputHolder}>
                <label>{t('Message')}</label>
                <div className={styles.inputRow}>
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => { setMessage(e.target.value) }}
                  />
                  <em></em>
                </div>
              </div>
              <div className={styles.inputHolder}>
                <label>{t('Expired in')}</label>
                <div className={styles.selectHolder}>
                  <select value={timelife} onChange={(e) => { setTimelife(e.target.value) }}>
                    <option value={0}>{t('Default ({timelife} seconds)', { timelife: factoryStatus.defaultExpireTime } )}</option>
                    {Object.keys(MINT_PRESET_EXPIRE).map((tl, index) => {
                      return (
                        <option key={index} value={tl}>{t(MINT_PRESET_EXPIRE[tl])}</option>
                      )
                    })}
                  </select>
                  <em></em>
                </div>
              </div>
            </div>
            <div className={styles.buttonsHolder}>
              <a onClick={doMintQrCode}>{t('Mint new QRCode')}</a>
              <a>{t('Create New Template and Mint QRCode')}</a>
              <a>{t('Cancel')}</a>
            </div>
          </>
        )}
      </div>
    </WorkChainHolder>
  )
}
