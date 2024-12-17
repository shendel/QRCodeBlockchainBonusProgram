import { useBrowserWeb3 } from '@/web3/BrowserWeb3Provider'
import styles from './index.module.scss'
import { toSvg } from 'jdenticon'

export default function Avatar(props) {
  const {
    size = 128,
    address,
    title,
    name
  } = props
  
  const {
    browserAccount
  } = useBrowserWeb3()
  
  const account = address || browserAccount
  const  avatarUrl = `data:image/svg+xml,${encodeURIComponent(toSvg(account, size))}`

  return (
    <div className={styles.avatarHolder}>
      {title && (
        <span>{title}</span>
      )}
      <img
        alt={account}
        title={account}
        src={avatarUrl}
      />
      <strong>{account.substring(0,8)}...{account.substring(-8,8)}</strong>
      {name && (
        <strong className={styles.name}>{name}</strong>
      )}
    </div>
  )
}