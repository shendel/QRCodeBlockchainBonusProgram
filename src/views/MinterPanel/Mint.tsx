
import { useEffect, useState, Component } from "react"
import { getAssets } from '@/helpers/getAssets'
import { useAccount } from 'wagmi'

import { QRCODE_ROLES, checkRole } from '@/qrcode_helpers/checkRole'

import WorkChainHolder from '@/components/qrcode/WorkChainHolder'

import callQRFactoryMethod from '@/qrcode_helpers/callQRFactoryMethod'
import {
  QRCODE_FACTORY,
  MINT_PRESET_AMMOUNT,
  MINT_PRESET_EXPIRE,
  MINT_MIN_BROWSER_ENERGY,
  WORK_CHAIN_ID
} from '@/config'

import { toWei, fromWei } from '@/helpers/wei'
import { getTranslate } from '@/translate'
import BigNumber from "bignumber.js"

import { useBrowserWeb3 } from '@/web3/BrowserWeb3Provider'
import { useInjectedWeb3 } from '@/web3/InjectedWeb3Provider'

import fetchBalance from '@/helpers/fetchBalance'
const t = getTranslate('MINT_PAGE')

import styles from './Mint.module.scss'

export default function MinterMint(props) {
  const {
    gotoPage,
    factoryStatus,
  } = props
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
    if (new BigNumber(amount).isLessThanOrEqualTo(0)) {
      return setAmountError(t('Amount must be greater than zero'))
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
  

  console.log(factoryStatus)
  return (
    <WorkChainHolder>
      <div className={styles.mintQrCodePanel}>
        <h2>Minter panel</h2>
        <nav>
          <a href="#/minter/">[Back]</a>
        </nav>
        {checkRole(connectedWallet, factoryStatus, QRCODE_ROLES.MINTER) ? (
          <div className={`adminForm ${(isMinting || isBrowserEnergyFetching) ? 'isLoading' : ''}`}>
            <header>{t('Mint new QRCode')}</header>
            <div className="inputHolder">
              <label>{t('Energy')}</label>
              <div className="infoRow">{fromWei(browserEnergy)}</div>
            </div>
            <div className="inputHolder">
              <label className="required">{t('Amount ({tokenSymbol})', { tokenSymbol: factoryStatus.tokenSymbol })}</label>
              <input
                className={(amountError != ``) ? 'hasError' : ''}
                type="number" 
                value={amount}
                onChange={(e) => { setAmount(e.target.value) }}
              />
              {amountError != `` && (
                <div className="error">{amountError}</div>
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
                <span>{t('predefined value:')}</span>
                {MINT_PRESET_AMMOUNT.map((amount, index) => {
                  return (
                    <a key={index} onClick={() => { setAmount(amount) }}>[{amount}]</a>
                  )
                })}
              </div>
              
            </div>
            <div className="inputHolder">
              <label>{t('Message')}</label>
              <input type="text" value={message} onChange={(e) => { setMessage(e.target.value) }} />
            </div>
            {/*
            <div className="inputHolder">
              <label>Expire in</label>
              <input type="number" value={timelife} onChange={(e) => { setTimelife(e.target.value) }} />
            </div>
            */}
            <div className="inputHolder">
              <label>{t('Expired in')}</label>
              <select value={timelife} onChange={(e) => { setTimelife(e.target.value) }}>
                <option value={0}>{t('Default ({timelife} seconds)', { timelife: factoryStatus.defaultExpireTime } )}</option>
                {Object.keys(MINT_PRESET_EXPIRE).map((tl, index) => {
                  return (
                    <option key={index} value={tl}>{t(MINT_PRESET_EXPIRE[tl])}</option>
                  )
                })}
              </select>
            </div>
            <div className="buttonsHolder">
              <button disabled={isMinting} onClick={doMintQrCode}>Mint new QRCode</button>
              <button disabled={isMinting} className="isCancel">{t('Cancel')}</button>
            </div>
          </div>
        ) : (
          <div>Access dinied</div>
        )}
      </div>
    </WorkChainHolder>
  )
}
