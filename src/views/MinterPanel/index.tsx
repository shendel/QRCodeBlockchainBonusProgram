
import { useEffect, useState, Component } from "react"
import { getAssets } from '@/helpers/getAssets'
import { useBrowserWeb3 } from '@/web3/BrowserWeb3Provider'

import fetchMinterInfo from '@/qrcode_helpers/fetchMinterInfo'

import { toWei, fromWei } from '@/helpers/wei'
import { getTranslate } from '@/translate'
import fetchBalance from '@/helpers/fetchBalance'
import styles from './index.module.scss'
import HeaderRow from '@/components/qrcode/HeaderRow/'
import LoaderFullScreen from '@/components/qrcode/LoaderFullScreen'
import Avatar from '@/components/qrcode/Avatar'
import InfoBlock from '@/components/qrcode/InfoBlock'
import ShowIcon from './assets/ShowIcon'

import MinterNewAccount from './NewAccount'

import {
  PROJECT_TITLE,
  QRCODE_FACTORY,
  WORK_CHAIN_ID
} from '@/config'

const t = getTranslate('MINTER_PAGE')

export default function Minter(props) {
  const {
    gotoPage,
    factoryStatus,
  } = props
  const {
    browserWeb3,
    browserAccount
  } = useBrowserWeb3()
  
  const [ minterInfo, setMinterInfo ] = useState(false)
  const [ isMinterInfoFetching, setIsMinterInfoFetching ] = useState(true)
  const [ isMinterInfoFetched, setIsMinterInfoFetched ] = useState(false)
  const [ isMinterInfoFetchError, setIsMinterInfoFetchError ] = useState(false)
  const [ isMinterAccount, setIsMinterAccount ] = useState(false)
  
  useEffect(() => {
    setIsMinterInfoFetched(false)
    setIsMinterInfoFetching(true)
    setIsMinterInfoFetchError(false)
    fetchMinterInfo({
      address: QRCODE_FACTORY,
      chainId: WORK_CHAIN_ID,
      minter: browserAccount,
    }).then(({ info, isMinter }) => {
      console.log('minter info', info, isMinter, factoryStatus)
      setIsMinterAccount(isMinter)
      setMinterInfo(info)
      setIsMinterInfoFetched(true)
      setIsMinterInfoFetching(false)
    }).catch((err) => {
      console.log('>Error', err)
      setIsMinterInfoFetchError(true)
      setIsMinterInfoFetching(false)
    })
  }, [ browserAccount ])
  
  if (!isMinterAccount && isMinterInfoFetched) {
    return (<MinterNewAccount {...props} />)
  }
  return (
    <div className={styles.minterPanel}>
      <HeaderRow title={PROJECT_TITLE} />
      {isMinterInfoFetching && (<LoaderFullScreen />)}
      {isMinterInfoFetched && (
        <>
          <div className={styles.mintButtonHolder}>
            <a
              className={styles.mintButton}
              onClick={() => { gotoPage('/minter/mint') }}
            >
              <span>Mint new QRCode</span>
            </a>
          </div>
          <div>
            <Avatar
              account={browserAccount}
              title={t('Your account')}
              gridView={true}
              size={64}
              name={minterInfo.name}
            >
              <div className={styles.avaButtonsHolder}>
                <a onClick={() => { gotoPage('/account/backup') }}>{t('Backup')}</a>
                <a onClick={() => { gotoPage('/account/restore') }}>{t('Restore')}</a>
              </div>
              <div className={styles.convertCupsHolder}>
                <a className={styles.convertCupsButton} onClick={() => { gotoPage('/minter/addpoints') }}>{t('Add bonus points')}</a>
              </div>
            </Avatar>
          </div>
          <div className={styles.summaryInfo}>
            <div>
              <span>Your energy</span>
              <div>
                {fromWei(minterInfo.energy)}
                <InfoBlock
                  message={t('This shows your current "energy" level in the system, which is necessary for creating QR codes with bonus points. If your energy drops to zero, contact technical support to restore your energy balance.')}
                />
              </div>
            </div>
            <div>
              <span>Balance of {factoryStatus.tokenName}</span>
              <div>
                {fromWei(minterInfo.balance, factoryStatus.tokenDecimals)}
                <InfoBlock
                  message={t('The total amount of bonus points that you can distribute across new QR codes.')}
                />
              </div>
            </div>
            <div>
              <span onClick={() => { gotoPage('/minter/codes/claimed/0') }}>Claimed {factoryStatus.tokenName}</span>
              <div>
                <a onClick={() => { gotoPage('/minter/codes/claimed/0') }}>
                  <em>{fromWei(minterInfo.claimedAmount, factoryStatus.tokenDecimals)}</em>
                  <ShowIcon />
                </a>
                <InfoBlock
                  message={t('The amount of bonus points that have already been successfully claimed by participants through activating QR codes.')}
                />
              </div>
            </div>
            <div>
              <span onClick={() => { gotoPage('/minter/codes/all/0') }}>Minted {factoryStatus.tokenName}</span>
              <div>
                <a onClick={() => { gotoPage('/minter/codes/all/0') }}>
                  <em>{fromWei(minterInfo.mintedAmount, factoryStatus.tokenDecimals)}</em>
                  <ShowIcon />
                </a>
                <InfoBlock
                  message={t('The total amount of bonus points that have been created over the entire period of system operation. This value is dynamically updated: bonus points from expired QR codes that were not claimed in time are removed from it.')}
                />
              </div>
            </div>
            <div>
              <span onClick={() => { gotoPage('/minter/codes/claimed/0') }}>Claimed QRCodes</span>
              <div>
                <a onClick={() => { gotoPage('/minter/codes/claimed/0') }}>
                  <em>{minterInfo.claimedQrCodesCount}</em>
                  <ShowIcon />
                </a>
                <InfoBlock
                  message={t('The number of QR codes that have already been successfully activated by participants. Each of these codes had its own balance of bonus points, which was transferred to the user.')}
                />
              </div>
            </div>
            {/*
              Not claimed
              The amount of bonus points assigned to active QR codes but not yet claimed by participants. These points are in an active state and can be used until the expiration date of the corresponding QR codes. After the code's expiration date, its balance is removed from Minted .
            */}
            <div>
              <span onClick={() => { gotoPage('/minter/codes/all/0') }}>Minted QRCodes</span>
              <div>
                <a onClick={() => { gotoPage('/minter/codes/all/0') }}>
                  <em>{minterInfo.mintedQrCodesCount}</em>
                  <ShowIcon />
                </a>
                <InfoBlock
                  message={t('The total number of QR codes that have been created over the entire period of system operation. This value is also dynamically updated: QR codes whose expiration date has passed without activation are excluded from it.')}
                />
              </div>
            </div>
            {/*
              Not claimed qr codes
              The number of QR codes that have been created, have a valid expiration date, and have not yet been activated by participants. Each of these codes contains bonus points awaiting use. If the code’s expiration date passes, it is automatically removed from the system, and its bonus points are no longer counted in Minted 
            */}
          </div>
        </>
      )}
    </div>
  )
}
