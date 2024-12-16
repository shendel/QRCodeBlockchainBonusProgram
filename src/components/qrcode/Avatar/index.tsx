import { useBrowserWeb3 } from '@/web3/BrowserWeb3Provider'
import styles from './index.module.scss'
import { toSvg } from 'jdenticon'

export default function Avatar(props) {
  const { size = 128 } = props
  
  const {
    browserAccount
  } = useBrowserWeb3()
  
  const  avatarUrl = `data:image/svg+xml,${encodeURIComponent(toSvg(browserAccount, size))}`

  return (
    <div className={styles.avatarHolder}>
      <img
        alt={browserAccount}
        title={browserAccount}
        src={avatarUrl}
      />
      <strong>{browserAccount}</strong>
    </div>
  )
}