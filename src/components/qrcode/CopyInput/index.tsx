import { useEffect, useState } from "react"
import styles from './index.module.scss'

export default function CopyInput(props) {
  const {
    value,
    multiline,
  } = props

  const [ isCopied, setIsCopied ] = useState(false)

  useEffect(() => {
    if (isCopied) {
      const timeoutId = setTimeout(() => {
        setIsCopied(false)
      }, 2000)
      return () => clearTimeout(timeoutId)
    }
  }, [ isCopied ])

  const handleCopy = () => {
    navigator.clipboard.writeText(value)
    setIsCopied(true)
  }
  
  return (
    <div className={styles.copyInput} onClick={() => { handleCopy() }}>
      {multiline ? (
        <textarea readOnly={true}>{value}</textarea>
      ) : (
        <input type="text" value={value} readOnly={true} />
      )}
      {isCopied && (
        <div>
          <strong>Copied</strong>
        </div>
      )}
    </div>
  )
}