
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
  
  useEffect(() => {
    setIsMinterInfoFetched(false)
    setIsMinterInfoFetching(true)
    setIsMinterInfoFetchError(false)
    fetchMinterInfo({
      address: QRCODE_FACTORY,
      chainId: WORK_CHAIN_ID,
      minter: browserAccount,
    }).then(({ info }) => {
      console.log('minter info', info, factoryStatus)
      setMinterInfo(info)
      setIsMinterInfoFetched(true)
      setIsMinterInfoFetching(false)
    }).catch((err) => {
      console.log('>Error', err)
      setIsMinterInfoFetchError(true)
      setIsMinterInfoFetching(false)
    })
  }, [ browserAccount ])
  
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
            </Avatar>
          </div>
          <div className={styles.summaryInfo}>
            <div>
              <span>Your energy</span>
              <div>
                {fromWei(minterInfo.energy)}
                <InfoBlock />
              </div>
            </div>
            <div>
              <span>Balance of {factoryStatus.tokenName}</span>
              <div>
                {fromWei(minterInfo.balance, factoryStatus.tokenDecimals)}
                <InfoBlock />
              </div>
            </div>
            <div onClick={() => { gotoPage('/minter/codes/claimed/0') }}>
              <span>Claimed {factoryStatus.tokenName}</span>
              <div>
                <a>
                  <em>{fromWei(minterInfo.claimedAmount, factoryStatus.tokenDecimals)}</em>
                  <ShowIcon />
                </a>
                <InfoBlock />
              </div>
            </div>
            <div onClick={() => { gotoPage('/minter/codes/all/0') }}>
              <span>Minted {factoryStatus.tokenName}</span>
              <div>
                <a>
                  <em>{fromWei(minterInfo.mintedAmount, factoryStatus.tokenDecimals)}</em>
                  <ShowIcon />
                </a>
                <InfoBlock />
              </div>
            </div>
            <div onClick={() => { gotoPage('/minter/codes/claimed/0') }}>
              <span>Claimed QRCodes</span>
              <div>
                <a>
                  <em>{minterInfo.claimedQrCodesCount}</em>
                  <ShowIcon />
                </a>
                <InfoBlock />
              </div>
            </div>
            <div onClick={() => { gotoPage('/minter/codes/all/0') }}>
              <span>Minted QRCodes</span>
              <div>
                <a>
                  <em>{minterInfo.mintedQrCodesCount}</em>
                  <ShowIcon />
                </a>
                <InfoBlock />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
