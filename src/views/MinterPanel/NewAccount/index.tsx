
import { useEffect, useState, Component } from "react"
import { getAssets } from '@/helpers/getAssets'
import { useBrowserWeb3 } from '@/web3/BrowserWeb3Provider'
import { getTranslate } from '@/translate'
import styles from './index.module.scss'
import HeaderRow from '@/components/qrcode/HeaderRow/'
import LoaderFullScreen from '@/components/qrcode/LoaderFullScreen'
import Avatar from '@/components/qrcode/Avatar'
import InfoBlock from '@/components/qrcode/InfoBlock'
import CopyInput from '@/components/qrcode/CopyInput'

import {
  PROJECT_TITLE,
  QRCODE_FACTORY,
  WORK_CHAIN_ID
} from '@/config'

const t = getTranslate('MINTER_NEW_ACCOUNT_PAGE')

export default function MinterNewAccount(props) {
  const {
    gotoPage,
    factoryStatus,
  } = props
  const {
    browserWeb3,
    browserAccount,
    browserMnemonic,
  } = useBrowserWeb3()

  return (
    <div className={styles.newMinterAccount}>
      <HeaderRow title={PROJECT_TITLE} />
      <div className={styles.avaHolder}>
        <Avatar
          account={browserAccount}
          title={t('Wellcome to QR-Bonus Programm for partners')}
          gridView={true}
          size={64}
          name={t(`Unknown user`)}
        >
          <div className={styles.avaButtonsHolder}>
            <a onClick={() => { gotoPage('/account/backup') }}>{t('Backup')}</a>
            <a onClick={() => { gotoPage('/account/restore') }}>{t('Restore')}</a>
          </div>
        </Avatar>
      </div>
      <div className={styles.infoBlock}>
        <p>Пользователь с таким адресом не найден среди партнёров.</p>
        <p>Восстанновите аккаунт из секретной фразы</p>
        <p>Если Вы новый партнёр, сохраните Вашу секретную фразу и сообщите нам ваш адрес</p>
        <strong>Ваш адрес</strong>
        <CopyInput value={browserAccount} />
        <strong>Ваша секретная фраза</strong>
        <CopyInput value={browserMnemonic} multiline={true} />
      </div>
    </div>
  )
}