import { useBrowserWeb3 } from '@/web3/BrowserWeb3Provider'
import styles from './index.module.scss'
import { toSvg } from 'jdenticon'

export default function Avatar(props) {
  const {
    size = 128,
    address,
    title,
    name,
    gridView = false,
    children,
  } = props
  
  const {
    browserAccount
  } = useBrowserWeb3()
  
  const account = (address || browserAccount).toUpperCase()
  const  avatarUrl = `data:image/svg+xml,${encodeURIComponent(toSvg(account, size))}`

  const accountAddress = (<strong>{account.substring(0,8)}...{account.substring(-8,8)}</strong>)
  const accountAva = (<img alt={account} title={account} src={avatarUrl} />)
  return (
    <div className={styles.avatarHolder}>
      {title && (
        <span>{title}</span>
      )}
      {gridView ? (
        <>
          <div className={styles.gridView}>
            {accountAva}
            <div>
              {accountAddress}
              {name && (
                <strong className={styles.name}>{name}</strong>
              )}
            </div>
          </div>
          {children}
        </>
      ) : (
        <>
          <div>
            {accountAva}
            {accountAddress}
            {name && (
              <strong className={styles.name}>{name}</strong>
            )}
          </div>
          {children}
        </>
      )}
    </div>
  )
}