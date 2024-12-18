import { useEffect, useState } from "react"
import styles from './index.module.scss'
//import InfoIcon from './InfoIcon'

export default function InfoBlock(props) {
  const {
    title = 'Info',
    message = 'Ok?'
  } = props 
  const [ isOpened, setIsOpened ] = useState(false)
  
  
  return (
    <div className={styles.infoBlock}>
      <a onClick={() => { setIsOpened(true) }}>
        [?]
      </a>
      {isOpened && (
        <div className={styles.popupHolder}>
          <button className={styles.closePopup} onClick={() => { setIsOpened(false) }}></button>
          <div className={styles.popupWindow}>
            <div className={styles.popupWindowTitle}>{title}</div>
            <div className={styles.popupWindowContent}>{message}</div>
            <div className={styles.popupWindowButtons}>
              <a className={styles.popupWindowClose} onClick={() => { setIsOpened(false) }}>Ok</a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}