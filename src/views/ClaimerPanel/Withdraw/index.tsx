import { useEffect, useState } from "react"
import HeaderRow from '@/components/qrcode/HeaderRow'
import styles from './index.module.scss'
import { getTranslate } from '@/translate'

import { useInjectedWeb3 } from '@/web3/InjectedWeb3Provider'
import ConnectWalletButton from '@/web3/ConnectWalletButton'
import LoaderFullScreen from '@/components/qrcode/LoaderFullScreen'
import SpinnerLoader from '@/components/qrcode/SpinnerLoader'
import OkIcon from './OkIcon'
import { toWei, fromWei } from '@/helpers/wei'
import fetchTokenAllowance from '@/helpers/fetchTokenAllowance'
import approveToken from '@/helpers/approveToken'
import fetchWalletStatus from '@/qrcode_helpers/fetchWalletStatus'
import callBridgeMethod from '@/qrcode_helpers/callBridgeMethod'
import fetchBridgeSwapInfo from '@/qrcode_helpers/fetchBridgeSwapInfo'
import delay from '@/helpers/delay'
import { useBrowserWeb3 } from '@/web3/BrowserWeb3Provider'
import { BigNumber } from 'bignumber.js'

import {
  WORK_CHAIN_ID,
  BRIDGE_WORK_CONTRACT,
  MAINNET_CHAIN_ID,
  MAINNET_TOKEN,
  PROJECT_TITLE,
} from '@/config'

export default function ClaimerWithdrawPanel(props) {
  const t = getTranslate('MINTER_NEW_ACCOUNT_PAGE')
  const {
    gotoPage,
    factoryStatus,
    backendStatus: {
      bridge_mainnet_tokenSymbol: mainnetSymbol,
    }
  } = props
  
  const { injectedAccount } = useInjectedWeb3()
  const {
    browserAccount,
    browserWeb3
  } = useBrowserWeb3()
  
  const [ energy, setEnergy ] = useState(0)
  const [ balance, setBalance ] = useState(0)
  const [ tokenDecimals, setTokenDecimals ] = useState(0)
  const [ tokenSymbol, setTokenSymbol ] = useState(``)
  
  const [ isBalanceFetching, setIsBalanceFetching ] = useState(true)

  const [ isAllowanceFetching, setIsAllowanceFetching ] = useState(false)
  const [ allowance, setAllowance ] = useState(0)

  
  useEffect(() => {
    if (browserAccount) {
      setIsBalanceFetching(true)
      fetchWalletStatus({
        address: browserAccount,
        chainId: WORK_CHAIN_ID,
        tokenAddress: factoryStatus.tokenAddress,
      }).then(({ energy, balance, tokenDecimals, tokenSymbol }) => {
        setBalance(balance)
        setEnergy(energy)
        setIsBalanceFetching(false)
        setTokenDecimals(tokenDecimals)
        setTokenSymbol(tokenSymbol)
        console.log('>>>> balance', balance, energy, tokenDecimals, tokenSymbol)
      }).catch((err) => {
        console.log(err)
      })
      setIsAllowanceFetching(true)
      fetchTokenAllowance({
        from: browserAccount,
        to: BRIDGE_WORK_CONTRACT,
        chainId: WORK_CHAIN_ID,
        tokenAddress: factoryStatus.tokenAddress,
      }).then(({ allowance }) => {
        console.log('>>> allowance', allowance)
        setAllowance(allowance)
        setIsAllowanceFetching(false)
      }).catch((err) => {
        console.log('>>> err', err)
      })
    }
  }, [ browserAccount ])
  
  
  
  const BRIDGE_STEPS = {
    PREPARE: 'PREPARE',                       // 1
    APPROVE: 'APPROVE',                       // 2
    APPROVE_TX: 'APPROVE_TX',                 // 3
    SEND_TO_BRIDGE: 'SEND_TO_BRIDGE',         // 4
    SEND_TO_BRIDGE_TX: 'SEND_TO_BRIDGE_TX',   // 5
    WAIT_SWAP: 'WAIT_SWAP'                    // 6
  }
  const [ bridgeStep, setBridgeStep ] = useState(BRIDGE_STEPS.PREPARE)
  const [ bridgeStepNumber, setBridgeStepNumber ] = useState(0)
  
  const [ isSwapping, setIsSwapping ] = useState(false)
  const [ isApproving, setIsApproving ] = useState(false)
  const [ approveHash, setApproveHash ] = useState(``)
  const [ isSendToBridge, setIsSendToBridge ] = useState(false)
  const [ outHash, setOutHash ] = useState(`0x...`)
  const [ swapId, setSwapId ] = useState(0)
  
  const doBridge = async () => {
    setIsSwapping(true)
    const weiAmount = balance
    setBridgeStepNumber(1)
    if (new BigNumber(weiAmount).isGreaterThan(allowance)) {
      setBridgeStep(BRIDGE_STEPS.APPROVE)
      setBridgeStepNumber(2)
      setIsApproving(true)
      try {
        await approveToken({
          activeWallet: browserAccount,
          activeWeb3: browserWeb3,
          tokenAddress: factoryStatus.tokenAddress,
          approveFor: BRIDGE_WORK_CONTRACT,
          weiAmount: `0x` + new BigNumber(weiAmount).toString(16),
          onTrx: (hash) => {
            setBridgeStep(BRIDGE_STEPS.APPROVE_TX)
            setApproveHash(hash)
            setBridgeStepNumber(3)
            setIsApproving(false)
          }
        })
      } catch (err) {
        console.log('Fail approve', err)
        setIsLoading(false)
        return
      }
    }
    setBridgeStep(BRIDGE_STEPS.SEND_TO_BRIDGE)
    setBridgeStepNumber(4)
    setIsSendToBridge(true)
    callBridgeMethod({
      activeWallet: browserAccount,
      activeWeb3: browserWeb3,
      contractAddress: BRIDGE_WORK_CONTRACT,
      method: 'swapOut',
      args: [
        injectedAccount,
        `0x` + new BigNumber(weiAmount).toString(16)
      ],
      onTrx: (hash) => {
        setBridgeStep(BRIDGE_STEPS.SEND_TO_BRIDGE_TX)
        setOutHash(hash)
        setBridgeStepNumber(5)
        setIsSendToBridge(false)
      }
    }).then((answer) => {
      console.log('>>> bridge answer', answer)
      if (answer?.events?.onSwapOut?.returnValues?.swapId) {
        console.log('>>> swapId', answer?.events?.onSwapOut?.returnValues?.swapId)
        setSwapId(answer?.events?.onSwapOut?.returnValues?.swapId)
        setBridgeStep(BRIDGE_STEPS.WAIT_SWAP)
        setBridgeStepNumber(6)
      }
    }).catch((err) => {
      console.log(err)
      
    })
  }

  const [ isSwapped, setIsSwapped ] = useState(false)
  const [ inHash, setInHash ] = useState(`0x...`)
  
  const [ tick, setTick ] = useState(0)

  useEffect(() => {
    if (swapId) {
      fetchBridgeSwapInfo({
        address: BRIDGE_WORK_CONTRACT,
        chainId: WORK_CHAIN_ID,
        swapId
      }).then(async ({ info }) => {
        const { swapped , inHash } = info
        if (swapped) {
          setInHash(inHash)
          setIsSwapping(false)
          setIsSwapped(true)
          setBridgeStepNumber(7)
        } else {
          await delay(5000)
          setTick(tick+1)
        }
      }).catch(async (err) => {
        console.log('err', err)
        await delay(5000)
        setTick(tick+1)
      })
    }
  }, [ swapId, tick ])
  
  const makeSmallHash = (hash) => {
    return `${hash.substring(0,10)}...${hash.substring(-10,10)}`
  }
  return (
    <div className={styles.climerWithdrawPanel}>
      {(isBalanceFetching || isAllowanceFetching || isSendToBridge || isApproving ) && (
        <LoaderFullScreen />
      )}
      <HeaderRow 
        title={PROJECT_TITLE}
        backUrl={`/`}
        gotoPage={gotoPage}
      />
      <div className={styles.titleHolder}>
        <div className={styles.title}>
          {t('Convert {bonusSymbol} to {backendSymbol}', {
            bonusSymbol: factoryStatus.tokenSymbol,
            backendSymbol: mainnetSymbol
          })}
        </div>
      </div>
      <div className={styles.balanceHolder}>
          <div>You balance</div>
          <strong>{fromWei(balance, tokenDecimals)}</strong>
          <em>{tokenSymbol}</em>
      </div>
      <div className={styles.walletInfo}>
        <div className={styles.title}>Destination wallet</div>
        {!injectedAccount ? (
          <>
            <ConnectWalletButton
              connectView={(isConnecting, openConnectModal) => {
                return (
                  <a 
                    onClick={openConnectModal}
                    className={`${styles.connectWalletButton} ${(isConnecting)} ? styles.isConnecting : ''}`}
                  >
                    {t((isConnecting) ? 'Connecting...' :'Connect wallet')}
                  </a>
                )
              }}
            />
          </>
        ) : (
          <>
            <div className={styles.walletAddress}>{injectedAccount}</div>
            {(isSwapping || isSwapped) && (
              <>
                <div className={styles.swapStatus}>
                  {!isSwapped && (
                    <span>
                      {t('Conversion in progress. Plase wait')}
                    </span>
                  )}
                  {isSwapped && (
                    <span>
                      {t('Conversion completed')}
                    </span>
                  )}
                </div>
                <div className={styles.swapStatusDetails}>
                  <ul>
                    {/* PREPARE */}
                    {bridgeStepNumber >= 1 && (
                      <li>
                        {bridgeStepNumber > 1 ? (<OkIcon />) : (<em></em>)}
                        <span>Preparing for bonus conversion</span>
                      </li>
                    )}
                    {/* APPROVE */}
                    {bridgeStepNumber >= 2 && (
                      <li>
                        {bridgeStepNumber > 2 ? (<OkIcon />) : (<em></em>)}
                        <span>Approving</span>
                      </li>
                    )}
                    {/* APPROVE_TX */}
                    {bridgeStepNumber >= 3 && (
                      <li>
                        {bridgeStepNumber > 3 ? (<OkIcon />) : (<em></em>)}
                        <span>Approving TX {makeSmallHash(approveHash)}</span>
                      </li>
                    )}
                    {/* SEND_TO_BRIDGE */}
                    {bridgeStepNumber >= 4 && (
                      <li>
                        {bridgeStepNumber > 4 ? (<OkIcon />) : (<em></em>)}
                        <span>Sending request to bridge</span>
                      </li>
                    )}
                    {/* SEND_TO_BRIDGE_TX */}
                    {bridgeStepNumber >= 5 && (
                      <li>
                        {bridgeStepNumber > 5 ? (<OkIcon />) : (<em></em>)}
                        <span>Сonversion TX {makeSmallHash(outHash)}</span>
                      </li>
                    )}
                    {/* WAIT_SWAP */}
                    {bridgeStepNumber >= 6 && (
                      <li>
                        {bridgeStepNumber > 6 ? (<OkIcon />) : (<em></em>)}
                        <span>Сonversion task #{swapId}</span>
                      </li>
                    )}
                    {/* READY */}
                    {bridgeStepNumber >= 7 && (
                      <li>
                        <OkIcon />
                        <span>Ready</span>
                      </li>
                    )}
                  </ul>
                </div>
              </>
            )}
            {isSwapped ? (
              <a onClick={() => { gotoPage('/') }} className={styles.widthdrawButton}>{t('Ready. Go to account')}</a>
            ) : (
              <>
                {!isSwapping && (
                  <>
                    {new BigNumber(balance).isGreaterThan(0) ? (
                      <a onClick={doBridge} className={styles.widthdrawButton}>{t('Withdraw')}</a>
                    ) : (
                      <a className={`${styles.widthdrawButton} ${styles.buttonDisabled}`}>{t('You dont have points for convert')}</a>
                    )}
                  </>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}