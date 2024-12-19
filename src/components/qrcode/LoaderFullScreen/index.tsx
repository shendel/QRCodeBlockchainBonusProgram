import styles from './index.module.scss'

export default function LoaderFullScreen() {
  return (
    <div className={styles.loaderFullScreenHolder}>
      <div className={styles.loaderFullScreen}></div>
    </div>
  )
}