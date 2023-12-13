import { useEffect, useState, Component } from "react"

export default function AccountInfo(props) {
  const {
    params: {
      account
    }
  } = props
  
  const [ counter, setCounter ] = useState(0)
  
  const counterUp = () => {
    setCounter( counter + 1 )
  }
  
  useEffect(() => {
    setCounter(0)
  }, [ account ] )
  return (
    <>
      <div>Account info: {account}</div>
      <div>
        <a onClick={() => { counterUp() }}>[Counter: {counter}]</a>
      </div>
      <a href={`#/account/${account}/txs`}>Txs</a>
    </>
  )
}