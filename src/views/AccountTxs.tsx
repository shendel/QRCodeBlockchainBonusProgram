import { useEffect, useState, Component } from "react"

export default function AccountTxs(props) {
  const {
    params: {
      account
    }
  } = props
  
  const [ counter, setCounter ] = useState(0)
  
  const counterUp = () => {
    setCounter( counter + 1 )
  }
  return (
    <>
      <div>Account Txs: {account}</div>
      <a onClick={() => { counterUp() }}>[Counter: {counter}]</a>
    </>
  )
}