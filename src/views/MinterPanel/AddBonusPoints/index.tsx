import { useEffect, useState } from "react"
import HeaderRow from '@/components/qrcode/HeaderRow'
import styles from './index.module.scss'
import { getTranslate } from '@/translate'

import { useInjectedWeb3 } from '@/web3/InjectedWeb3Provider'
import ConnectWalletButton from '@/web3/ConnectWalletButton'
import DisconnectWalletButton from '@/web3/DisconnectWalletButton'

import LoaderFullScreen from '@/components/qrcode/LoaderFullScreen'
import SpinnerLoader from '@/components/qrcode/SpinnerLoader'
import OkIcon from './OkIcon'
import { toWei, fromWei } from '@/helpers/wei'
import fetchTokenAllowance from '@/helpers/fetchTokenAllowance'
import approveToken from '@/helpers/approveToken'
import fetchWalletStatus from '@/qrcode_helpers/fetchWalletStatus'
import callBridgeMethod from '@/qrcode_helpers/callBridgeMethod'
import callMinterBridgeMethod from '@/qrcode_helpers/callMinterBridgeMethod'
import fetchBridgeSwapInfo from '@/qrcode_helpers/fetchBridgeSwapInfo'

import fetchMinterBridgeInfo from '@/qrcode_helpers/fetchMinterBridgeInfo'

import delay from '@/helpers/delay'
import { useBrowserWeb3 } from '@/web3/BrowserWeb3Provider'
import { BigNumber } from 'bignumber.js'

import {
  WORK_CHAIN_ID,
  BRIDGE_WORK_CONTRACT,
  MAINNET_CHAIN_ID,
  MINTER_BRIDGE_TOKEN,
  MINTER_BRIDGE_MAINNET_CONTRACT,
  MINTER_BRIDGE_WORK_CONTRACT,
  MAINNET_TOKEN,
  PROJECT_TITLE,
} from '@/config'

import { GET_CHAIN_BYID } from '@/web3/chains'

import * as TgSdk from '@telegram-apps/sdk';
import { requestBiometryAccess } from '@telegram-apps/sdk';

export default function MinterAddBonusPointsPanel(props) {
  const t = getTranslate('MINTER_ADD_BONUS_POINTS_PAGE')
  const {
    gotoPage,
    factoryStatus,
    backendStatus: {
      minter_bridge_token,
    }
  } = props
  
  const MAINNET_CHAIN_INFO = GET_CHAIN_BYID(MAINNET_CHAIN_ID)
  console.log('>>> MAINNET_CHAIN_INFO', MAINNET_CHAIN_INFO)
  
  const {
    injectedAccount,
    injectedWeb3,
    injectedChainId,
    isSwitchingNetwork: injectedIsWitchNetwork,
    switchNetwork: injectedSwitchNetwork
  } = useInjectedWeb3()

  console.log('>>>> INJECTED TEST', injectedChainId, injectedIsWitchNetwork, injectedSwitchNetwork)

  const {
    browserAccount,
    browserWeb3,
    browserChainId,
    isSwitchingNetwork: browserIsWitchNetwork,
    switchNetwork: browserSwitchNetwork
  } = useBrowserWeb3()
  
  const [ energyBrowser, setEnergyBrowser ] = useState(0)
  const [ energyInjected, setEnergyInjected ] = useState(0)
  const [ balanceBrowser, setBalanceBrowser ] = useState(0)
  const [ balanceInjected, setBalanceInjected ] = useState(0)
  const [ tokenDecimals, setTokenDecimals ] = useState(0)
  const [ tokenSymbol, setTokenSymbol ] = useState(``)
  const [ isTokenInfoFetched, setIsTokenInfoFetched ] = useState(false)

  const [ isBalanceBrowserFetching, setIsBalanceBrowserFetching ] = useState(false)
  const [ isBalanceInjectedFetching, setIsBalanceInjectedFetching ] = useState(false)


  const [ isAllowanceBrowserFetching, setIsAllowanceBrowserFetching ] = useState(false)
  const [ isAllowanceInjectedFetching, setIsAllowanceInjectedFetching ] = useState(false)
  const [ allowanceBrowser, setAllowanceBrowser ] = useState(0)
  const [ allowanceInjected, setAllowanceInjected ] = useState(0)

  const [ screenLocked, setScreenLocked ] = useState(false)
  
  useEffect(() => {
    const _setZero = () => {
      setIsBalanceInjectedFetching(false)
      setIsAllowanceInjectedFetching(false)
      setAllowanceInjected(0)
      setBalanceInjected(0)
      setEnergyInjected(0)
    }
    if (injectedAccount) {
      setIsBalanceInjectedFetching(true)
      setIsAllowanceInjectedFetching(false)
      fetchWalletStatus({
        address: injectedAccount,
        chainId: MAINNET_CHAIN_ID,
        tokenAddress: MINTER_BRIDGE_TOKEN,
      }).then(({ energy, balance, tokenDecimals, tokenSymbol }) => {
        setBalanceInjected(balance)
        setEnergyInjected(energy)
        setIsBalanceInjectedFetching(false)
        console.log('>>>> balance', balance, energy, tokenDecimals, tokenSymbol)
        setIsAllowanceInjectedFetching(true)
        fetchTokenAllowance({
          from: injectedAccount,
          to: MINTER_BRIDGE_MAINNET_CONTRACT,
          tokenAddress: MINTER_BRIDGE_TOKEN,
          chainId: MAINNET_CHAIN_ID,
        }).then(({ allowance }) => {
          console.log('>>> injected allowance', allowance)
          setIsAllowanceInjectedFetching(false)
          setAllowanceInjected(allowance)
        }).catch((err) => {
          console.log(err)
          setIsAllowanceInjectedFetching(false)
          setAllowanceInjected(0)
        })
      }).catch((err) => {
        console.log(err)
        _setZero()
      })
    } else {
      _setZero()
    }
  }, [ injectedAccount ])
  
  useEffect(() => {
    const _setZero = () => {
      setIsBalanceBrowserFetching(false)
      setIsAllowanceBrowserFetching(false)
      setAllowanceBrowser(0)
      setBalanceBrowser(0)
      setEnergyBrowser(0)
    }
    if (browserAccount) {
      setIsBalanceBrowserFetching(true)
      setIsAllowanceBrowserFetching(false)
      fetchWalletStatus({
        address: browserAccount,
        chainId: MAINNET_CHAIN_ID,
        tokenAddress: MINTER_BRIDGE_TOKEN,
      }).then(({ energy, balance, tokenDecimals, tokenSymbol }) => {
        setBalanceBrowser(balance)
        setEnergyBrowser(energy)
        setIsBalanceBrowserFetching(false)
        setTokenDecimals(tokenDecimals)
        setTokenSymbol(tokenSymbol)
        setIsTokenInfoFetched(true)
        console.log('>>>> balance', balance, energy, tokenDecimals, tokenSymbol)
        setIsAllowanceBrowserFetching(true)
        fetchTokenAllowance({
          from: browserAccount,
          to: MINTER_BRIDGE_MAINNET_CONTRACT,
          tokenAddress: MINTER_BRIDGE_TOKEN,
          chainId: MAINNET_CHAIN_ID,
        }).then(({ allowance }) => {
          console.log('>>> browser allowance', allowance)
          setIsAllowanceBrowserFetching(false)
          setAllowanceBrowser(allowance)
        }).catch((err) => {
          console.log(err)
          setIsAllowanceBrowserFetching(false)
          setAllowanceBrowser(0)
        })
      }).catch((err) => {
        console.log(err)
        _setZero()
      })
    } else {
      _setZero()
    }
  }, [ browserAccount])
  
  
  const isBalanceFetching = isBalanceInjectedFetching || isBalanceBrowserFetching || !isTokenInfoFetched
  const balance = (injectedAccount) ? balanceInjected : balanceBrowser
  const energy = (injectedAccount) ? energyInjected : energyBrowser

  
  const isAllowanceFetching = (isAllowanceBrowserFetching || isAllowanceInjectedFetching)
  const allowance = (injectedAccount) ? allowanceInjected : allowanceBrowser

  
  /* bridge info */
  const [ isBridgeInfoFetching, setIsBridgeInfoFetching ] = useState(false)
  const [ isBridgeInfoFetched, setIsBridgeInfoFetched ] = useState(false)
  const [ bridgeInfo, setBridgeInfo ] = useState({})

  useEffect(() => {
    setIsBridgeInfoFetching(true)
    setIsBridgeInfoFetched(false)
    fetchMinterBridgeInfo({
      workChainId: WORK_CHAIN_ID,
      mainChainId: MAINNET_CHAIN_ID,
      workAddress: MINTER_BRIDGE_WORK_CONTRACT,
      mainAddress: MINTER_BRIDGE_MAINNET_CONTRACT,
    }).then((answer) => {
      console.log('Minter bridge info', answer)
      setBridgeInfo(answer)
      setIsBridgeInfoFetching(false)
      setIsBridgeInfoFetched(true)
    }).catch((err) => {
      console.log('>>> err')
      console.log(err)
      setIsBridgeInfoFetching(false)
      setIsBridgeInfoFetched(true)
    })
  }, [
    WORK_CHAIN_ID,
    MAINNET_CHAIN_ID,
    MINTER_BRIDGE_MAINNET_CONTRACT,
    MINTER_BRIDGE_WORK_CONTRACT,
  ])
  
  
  const [ spendAmount, setSpendAmount ] = useState(0)
  const [ spendAmountTimeout, setSpendAmountTimeout ] = useState(0)
  const [ getAmount, setGetAmount ] = useState(0)
  
  const calcInAmount= (outAmount) => {
    const {
      main: {
        outToInRate,
        outTokenDecimals,
        inTokenDecimals,
      }
    } = bridgeInfo
    const tenPowerOutDecimals = new BigNumber(10).pow(outTokenDecimals);
    const tenPowerInDecimals = new BigNumber(10).pow(inTokenDecimals);
    return new BigNumber(outAmount)
      .dividedBy(tenPowerOutDecimals)
      .multipliedBy(tenPowerInDecimals)
      .multipliedBy(outToInRate)
  }

  useEffect(() => {
    let timer
    if (spendAmount !== spendAmountTimeout) {
      timer = setTimeout(() => {
        setSpendAmountTimeout(spendAmount)
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [ spendAmount, spendAmountTimeout ])

  const handleSpendAmountChange = (v) => {
    const {
      main: {
        outTokenDecimals,
        inTokenDecimals,
      }
    } = bridgeInfo
    setSpendAmount(v)
    setGetAmount(
      fromWei(
        calcInAmount(
          toWei(
            v.replaceAll(',','.'),
            outTokenDecimals
          )
        ),
        inTokenDecimals
      )
    )
  }
  const needApprove = (() => {
    if (new BigNumber(spendAmount).isGreaterThan(0) && isBridgeInfoFetched) {
      const {
        main: {
          outTokenDecimals,
        }
      } = bridgeInfo
      const outAmountWei = new BigNumber(toWei(spendAmount, outTokenDecimals))
      return outAmountWei.isGreaterThan((injectedAccount) ? allowanceInjected : allowanceBrowser)
    } else {
      return false
    }
  })()
  
  const [ isApproving, setIsApproving ] = useState(false)
  const handleApprove = () => {
    if (!isApproving) {
      setIsApproving(true)
      const {
        main: {
          outTokenDecimals,
        }
      } = bridgeInfo
      const amountWei = toWei(spendAmount, outTokenDecimals)
      approveToken({
        activeWallet: (injectedAccount) ? injectedAccount : browserAccount,
        activeWeb3: (injectedAccount) ? injectedWeb3 : browserWeb3,
        tokenAddress: MINTER_BRIDGE_TOKEN,
        approveFor: MINTER_BRIDGE_MAINNET_CONTRACT,
        weiAmount: `0x` + new BigNumber(amountWei).toString(16),
      }).then((answer) => {
        console.log('>>> approved', answer)
        setIsApproving(false)
        if (injectedAccount) {
          setAllowanceInjected(amountWei)
        } else {
          setAllowanceBrowser(amountWei)
        }
      }).catch((err) => {
        console.log('Fail approve', err)
        setIsApproving(false)
      })
    }
  }
  // Calc needed gas for fee 
  const [ neededGasForFee, setNeededGasForFee ] = useState(false)
  
  const activeChainId = (injectedAccount) ? injectedChainId : browserChainId
  
  useEffect(() => {
    console.log('>>> calc gas')
    if (isBridgeInfoFetched && !isNeedSwitchNetwork && (activeChainId == MAINNET_CHAIN_ID)) {
      const {
        main: {
          outTokenDecimals,
        }
      } = bridgeInfo
      const amountWei = toWei(spendAmount, outTokenDecimals)
      if (new BigNumber(amountWei).isGreaterThan(allowance)) {
        console.log('>>> spendAmount', spendAmount, toWei(spendAmount, outTokenDecimals))
        approveToken({
          activeWallet: (injectedAccount) ? injectedAccount : browserAccount,
          activeWeb3: (injectedAccount) ? injectedWeb3 : browserWeb3,
          tokenAddress: MINTER_BRIDGE_TOKEN,
          approveFor: MINTER_BRIDGE_MAINNET_CONTRACT,
          weiAmount: `0x` + new BigNumber(amountWei).toString(16),
          calcGas: true,
        }).then(({ gas }) => {
          setNeededGasForFee(gas)
        })
      }
    }
  }, [ spendAmountTimeout, activeChainId ])
  /* ----------- */


  const isNeedSwitchNetwork = (injectedAccount)
    ? (injectedChainId != MAINNET_CHAIN_ID)
    : (browserChainId != MAINNET_CHAIN_ID)
    
  const handleSwitchNetwork = () => {
    if (injectedAccount) {
      injectedSwitchNetwork(MAINNET_CHAIN_ID)
    } else {
      browserSwitchNetwork(MAINNET_CHAIN_ID)
    }
  }

  const BRIDGE_STEPS = {
    PREPARE: 'PREPARE',                       // 1
    APPROVE: 'APPROVE',                       // 2
    APPROVE_TX: 'APPROVE_TX',                 // 3
    SEND_TO_BRIDGE: 'SEND_TO_BRIDGE',         // 4
    SEND_TO_BRIDGE_TX: 'SEND_TO_BRIDGE_TX',   // 5
    WAIT_SWAP: 'WAIT_SWAP'                    // 6
  }
  const [ bridgeStep, setBridgeStep ] = useState(BRIDGE_STEPS.PREPARE)
  const [ bridgeStepNumber, setBridgeStepNumber ] = useState(7)
  
  const [ isSwapping, setIsSwapping ] = useState(false)
  
  const [ approveHash, setApproveHash ] = useState(``)
  const [ isSendToBridge, setIsSendToBridge ] = useState(false)
  const [ outHash, setOutHash ] = useState(`0x...`)
  const [ swapId, setSwapId ] = useState(0)
  
  const doBridge = async () => {
    setIsSwapping(true)
    const {
      main: {
        outTokenDecimals,
      }
    } = bridgeInfo
    const amountWei = toWei(spendAmount, outTokenDecimals)
    console.log('>>> amountWei', amountWei)
    setBridgeStepNumber(1)
    
    setBridgeStep(BRIDGE_STEPS.SEND_TO_BRIDGE)
    setBridgeStepNumber(4)
    setIsSendToBridge(true)
    callMinterBridgeMethod({
      activeWallet: (injectedAccount) ? injectedAccount : browserAccount,
      activeWeb3: (injectedAccount) ? injectedWeb3 : browserWeb3,
      contractAddress: MINTER_BRIDGE_MAINNET_CONTRACT,
      method: 'swapOut',
      args: [
        browserAccount,
        `0x` + new BigNumber(amountWei).toString(16)
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
      setIsSwapping(false)
      setIsSendToBridge(false)
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
        console.log('>>>> info', info)
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
    return `${hash.substr(0,10)}...${hash.substr(-10,10)}`
  }

  const isZeroAmount = !new BigNumber(spendAmount).isGreaterThan(0)
  return (
    <div className={styles.climerWithdrawPanel}>
      {(isBalanceFetching || isAllowanceFetching || isSendToBridge || isApproving || screenLocked ) && (
        <LoaderFullScreen />
      )}
      <HeaderRow 
        title={PROJECT_TITLE}
        backUrl={`/`}
        gotoPage={gotoPage}
      />
      <div className={styles.titleHolder}>
        <div className={styles.title}>
          {t('Convert {backendSymbol} to {bonusSymbol}', {
            bonusSymbol: factoryStatus.tokenSymbol,
            backendSymbol: minter_bridge_token.symbol,
          })}
        </div>
      </div>
      <div className={styles.sourceWallet}>
        <div className={styles.title}>
          {t('Source wallet')}
        </div>
        {!injectedAccount ? (
          <>
            <div className={styles.walletAddress}>{browserAccount}</div>
            <ConnectWalletButton
              connectView={(isConnecting, openConnectModal) => {
                return (
                  <a 
                    onClick={() => { if (!isSwapping) { openConnectModal() }}}
                    className={`${styles.connectWalletButton} ${(isConnecting || isSwapping)} ? styles.isConnecting : ''}`}
                  >
                    {t((isConnecting) ? 'Connecting...' :'or Connect other wallet')}
                  </a>
                )
              }}
            />
          </>
        ) : (
          <>
            <div className={styles.walletAddress}>{injectedAccount}</div>
            <DisconnectWalletButton
              view={(handleDisconnect) => {
                return (
                  <a 
                    onClick={() => { if (!isSwapping) { handleDisconnect() } }}
                    className={`${styles.disconnectWalletButton} ${(isSwapping) ? styles.buttonDisabled : ''}`}
                  >
                    {t('Disconnect wallet')}
                  </a>
                )
              }}
            />
          </>
        )}
      </div>
      <div className={styles.balanceHolder}>
        <div>You balance</div>
        {isTokenInfoFetched ? (
          <>
            <strong>{(isBalanceFetching) ? `...` : fromWei(balance, tokenDecimals)}</strong>
            <em>{tokenSymbol}</em>
          </>
        ) : (
          <>
            <strong>{`...`}</strong>
            <em>{`...`}</em>
          </>
        )}
        <span>
          {t('And')}
          <em>{(isBalanceFetching) ? `...` : fromWei(energy)}</em>
          <strong>{(isBalanceFetching) ? `...` : MAINNET_CHAIN_INFO.nativeCurrency.symbol}</strong>
          {t('for txs fee payment')}
        </span>
      </div>
      <div className={styles.formHolder}>
        <div className={styles.label}>
          {t('You want to spend:')}
        </div>
        <div className={`${styles.inputRow} ${(isApproving || isSwapping) ? styles.disabled : ''}`}>
          <input type="number" min={0} value={spendAmount} readOnly={isApproving || isSwapping} onChange={(e) => { handleSpendAmountChange(e.target.value) }} />
          <em></em>
          <strong>{(isTokenInfoFetched) ? tokenSymbol : `...`}</strong>
        </div>
        <div className={styles.label}>
          {t('You will receive')}
        </div>
        <div className={`${styles.inputRow} ${styles.readOnly} ${(isApproving || isSwapping) ? styles.disabled : ''}`}>
          <div>{getAmount}</div>
          <em></em>
          <strong>{factoryStatus.tokenSymbol}</strong>
        </div>
      </div>
      <div className={styles.swapPanel}>
        {isNeedSwitchNetwork ? (
          <>
            <a className={styles.button} onClick={handleSwitchNetwork}>
              {t('Switch network')}
            </a>
          </>
        ) : (
          <>
            {needApprove ? (
              <>
                {isApproving ? (
                  <a className={`${styles.button} ${styles.buttonDisabled}`}>
                    {t('Approving...')}
                  </a>
                ) : (
                  <a className={styles.button} onClick={handleApprove}>
                    {t('Approve {symbol}', { symbol: minter_bridge_token.symbol })}
                  </a>
                )}
                {neededGasForFee && (
                  <div className={styles.txFeeInfo}>
                    {t('Tx fee ~')}
                    <em>{fromWei(neededGasForFee)}</em>
                    <strong>{MAINNET_CHAIN_INFO.nativeCurrency.symbol}</strong>
                  </div>
                )}
              </>
            ) : (
              <>
                {!isSwapping && (
                  <a className={`${styles.button} ${(isZeroAmount) ? styles.buttonDisabled : ''}`} onClick={doBridge}>
                    {!isSwapped
                      ? t('Swap')
                      : t('Swap again')
                    }
                  </a>
                )}
              </>
            )}
          </>
        )}
      </div>
      <div className={styles.walletInfo}>
        <>
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
                      <span>Ready. TX {makeSmallHash(inHash)}</span>
                    </li>
                  )}
                </ul>
              </div>
            </>
          )}
          {isSwapped && (
            <a onClick={() => { gotoPage('/') }} className={styles.widthdrawButton}>{t('Ready. Go to account')}</a>
          )}
        </>
      </div>
    </div>
  )
}