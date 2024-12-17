import styles from "./index.module.scss"

import BackIcon from './BackIcon'

export default function HeaderRow(props) {
  const {
    title,
    backUrl,
    gotoPage,
  } = props
  
  return (
    <header className={styles.header}>
      {backUrl && (
        <a onClick={() => { gotoPage(backUrl) }}>
          <BackIcon />
        </a>
      )}
      <span>{title}</span>
    </header>
  )
}