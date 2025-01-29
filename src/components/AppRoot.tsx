import Web3Connector from '@/web3/Web3Connector'
import BrowserWeb3Provider from '@/web3/BrowserWeb3Provider'
import InjectedWeb3Provider from '@/web3/InjectedWeb3Provider'



export default function AppRoot(props) {
  const {
    children,
    chainId,
  } = props
  const {
    chainIds,
  } = {
    chainIds: [ chainId ],
    ...props
  }
  
  return (
    <>
      <BrowserWeb3Provider chainId={chainId} chainIds={chainIds}>
        <Web3Connector chainIds={chainIds} autoConnect={true}>
          <InjectedWeb3Provider chainId={chainId} chainIds={chainIds}>
            {children}
          </InjectedWeb3Provider>
        </Web3Connector>
      </BrowserWeb3Provider>
    </>
  )
}