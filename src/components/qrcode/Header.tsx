import { ConnectWalletButton } from '@/web3/ConnectWalletButton'
import { useBrowserWeb3 } from '@/web3/BrowserWeb3Provider'

export default function Header(props) {
  const {
    browserAccount
  } = useBrowserWeb3()
  
  return (
    <header className="mainHeader">
      <div>
        <span>Browser account:</span>
        <a href="#/account/">[{browserAccount}]</a>
      </div>
      <div>
        <span>Injected account:</span>
        <ConnectWalletButton
          connectView={(isConnecting, openConnectModal) => {
            return (
              <button disabled={isConnecting} onClick={openConnectModal}>Do connect</button>
            )
          }}
          connectedView={(address) => {
            return (<div>[{address}]</div>)
          }}
          wrongChainView={(openChainModal) => {
            return (
              <button onClick={openChainModal}>
                Switch chain
              </button>
            )
          }}
        />
      </div>
    </header>
  )
}