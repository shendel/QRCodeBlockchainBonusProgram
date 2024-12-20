import styles from './index.module.scss'


export default function Title(props) {
  const {
    title
  } = props
  
  return (
    <div className={styles.qrcodeTitleHolder}>
      <div className={styles.qrcodeTitle}>{title}</div>
    </div>
  )
}