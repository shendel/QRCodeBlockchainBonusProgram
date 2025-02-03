import { useEffect, useState, createContext, useContext } from "react"
import styles from './index.module.scss'

const AlertModalContext = createContext({
  openModal: () => {}
})

export const useAlertModal = () => {
  return useContext(AlertModalContext)
}

export default function AlertModal(props) {
  const {
    children
  } = props
  
  const [ title, setTitle ] = useState('title')
  const [ message, setMessage ] = useState('message')
  const [ okTitle, setOkTitle ] = useState('Ok')
  
  const openModal = (options) => {
    const {
      title,
      message,
      okTitle,
    } = {
      title: 'title',
      message: 'message',
      okTitle: 'Ok',
      ...options
    }
    setTitle(title)
    setMessage(message)
    setOkTitle(okTitle)
    setIsOpened(true)
  }
  
  const [ isOpened, setIsOpened ] = useState(false)
  return (
    <AlertModalContext.Provider
      value={{
        openModal
      }}
    >
      {children}
      <div className={styles.alertModal}>
        {isOpened && (
          <div className={styles.popupHolder}>
            <button className={styles.closePopup} onClick={() => { setIsOpened(false) }}></button>
            <div className={styles.popupWindow}>
              <div className={styles.popupWindowTitle}>{title}</div>
              <div className={styles.popupWindowContent}>{message}</div>
              <div className={styles.popupWindowButtons}>
                <a className={styles.popupWindowClose} onClick={() => { setIsOpened(false) }}>{okTitle}</a>
              </div>
            </div>
          </div>
        )}
      </div>
    </AlertModalContext.Provider>
  )
}