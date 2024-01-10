import callBridgeMethod from '@/qrcode_helpers/callBridgeMethod'

import { useEffect, useState, Component } from "react"
import { getAssets } from '@/helpers/getAssets'
import { useAccount, useNetwork, useSwitchNetwork } from 'wagmi'
import { useInjectedWeb3 } from '@/web3/InjectedWeb3Provider'

import { translate as t } from '@/translate'
import { fromWei } from '@/helpers/wei'

import {
  WORK_CHAIN_ID,
  MAINNET_CHAIN_ID,
  BRIDGE_MAINNET_CONTRACT,
  BRIDGE_WORK_CONTRACT,
} from '@/config'

export default function AdminPanelBridgeWithdrawTokens(props) {
  const {
    gotoPage,
    params: {
      target
    },
    backendStatus: {
      bridge_qrcode_tokenBalance,
      bridge_qrcode_tokenDecimals,
      bridge_qrcode_tokenSymbol,
      bridge_mainnet_tokenBalance,
      bridge_mainnet_tokenDecimals,
      bridge_mainnet_tokenSymbol,
    },
    UpdateBackendStatus,
  } = props

  const TARGET_NAME = {
    qrcode: 'QRCode-chain',
    mainnet: 'Mainnet-chain'
  }
  const TARGET_CHAIN = {
    qrcode: WORK_CHAIN_ID,
    mainnet: MAINNET_CHAIN_ID,
  }

  const TARGET_CONTRACT = {
    qrcode: BRIDGE_WORK_CONTRACT,
    mainnet: BRIDGE_MAINNET_CONTRACT,
  }

  const contractInfo = {
    balance: (target == 'qrcode') ? bridge_qrcode_tokenBalance : bridge_mainnet_tokenBalance,
    decimals: (target == 'qrcode') ? bridge_qrcode_tokenDecimals : bridge_mainnet_tokenDecimals,
    symbol: (target == 'qrcode') ? bridge_qrcode_tokenSymbol : bridge_mainnet_tokenSymbol,
  }
  
    
  const {
    injectedAccount,
    injectedWeb3
  } = useInjectedWeb3()
  
  const { chain } = useNetwork()
  const { switchNetwork } = useSwitchNetwork()

  const [ isWithdrawing, setIsWithdrawing ] = useState(false)
  const [ isWithdrawed, setIsWithdrawed ] = useState(false)
  
  const doWithdraw = () => {
    setIsWithdrawing(true)
    callBridgeMethod({
      activeWallet: injectedAccount,
      activeWeb3: injectedWeb3,
      contractAddress: TARGET_CONTRACT[target],
      method: 'withdrawTokens',
      args: [ injectedAccount ],
    }).then((answer) => {
      setIsWithdrawing(false)
      setIsWithdrawed(true)
      UpdateBackendStatus()
    }).catch((err) => {
      setIsWithdrawing(false)
      console.log(err)
    })
  }
  return (
    <>
      <h3>AdminPanel - Add tokens</h3>
      <nav>
        <a href="#/admin/">[Back]</a>
      </nav>
      <div>
        <div className={`adminForm ${(isWithdrawing) ? 'isLoading' : ''}`}>
          <header>{t('Withdraw tokens from {name} bridge', { name: TARGET_NAME[target] })}</header>
          {!isWithdrawed ? (
            <>
              <div className="inputHolder">
                <label>{t('Tokens at bridge')}</label>
                <div className="infoRow">
                  {fromWei(contractInfo.balance, contractInfo.decimals)}
                  {` `}
                  <strong>{contractInfo.symbol}</strong>
                </div>
              </div>
              <div className="buttonsHolder">
                {TARGET_CHAIN[target] != chain.id ? (
                  <button
                    onClick={() => { switchNetwork(TARGET_CHAIN[target]) }}
                  >
                    {t('Switch network')}
                  </button>
                ) : (
                  <button
                    onClick={doWithdraw}
                    disabled={isWithdrawing}
                  >
                    {(isWithdrawing)
                      ? t('Withdrawing tokens...')
                      : t('Withdraw all tokens')
                    }
                  </button>
                )}
                <button disabled={isWithdrawing} onClick={() => { gotoPage('/admin/') }} className="isCancel">{t('Cancel')}</button>
              </div>
            </>
          ) : (
            <>
              <div className="inputHolder">
                {t('Tokens successfull withdrawed from bridge contract')}
              </div>
              <div className="buttonsHolder">
                <button onClick={() => { gotoPage('/admin/') }} className="isGreen">
                  {t('Go back')}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
