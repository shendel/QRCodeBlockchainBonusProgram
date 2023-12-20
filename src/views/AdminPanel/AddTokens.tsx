
import { useEffect, useState, Component } from "react"
import { getAssets } from '@/helpers/getAssets'
import { useAccount } from 'wagmi'

import { translate as t } from '@/translate'

import fetchTokenBalance from '@/helpers/fetchTokenBalance'
import { WORK_CHAIN_ID } from '@/config'
import { toWei, fromWei } from '@/helpers/wei'
import BigNumber from "bignumber.js"
import sendERC20 from '@/web3/sendERC20'


export default function AdminPanelAddTokens(props) {
  const {
    gotoPage,
    factoryStatus,
    UpdateFactoryStatus
  } = props
  const { address: connectedWallet } = useAccount()
  const account = useAccount()
  
  const [ isTokensAdded, setIsTokensAdded ] = useState(false)
  const [ connectedWalletBalance, setConnectedWalletBalance ] = useState(0)
  const [ isBalanceFetching, setIsBalanceFetching ] = useState(true)
  const [ isBalanceFetchingError, setIsBalanceFetchingError ] = useState(false)

  useEffect(() => {
    if (connectedWallet && factoryStatus && factoryStatus.tokenAddress) {
      setIsBalanceFetching(true)
      setIsBalanceFetchingError(false)
      fetchTokenBalance({
        wallet: connectedWallet,
        tokenAddress: factoryStatus.tokenAddress,
        chainId: WORK_CHAIN_ID,
      }).then((balance) => {
        setConnectedWalletBalance(balance.wei)
        setIsBalanceFetching(false)
        setIsBalanceFetchingError(false)
      }).catch((err) => {
        setIsBalanceFetchingError(true)
        setIsBalanceFetching(false)
        console.log('>> err', err)
      })
    }
  }, [ connectedWallet, factoryStatus ])

  const [ newTokensAmount, setNewTokensAmount ] = useState(0)
  const [ newTokensAmountError, setNewTokensAmountError ] = useState(``)
  const [ isTokensSending, setIsTokensSending ] = useState(false)


  useEffect(() => {
    setNewTokensAmountError(``)
  }, [ newTokensAmount ])
  
  const doAddTokens = () => {
    const amountInWei = toWei(newTokensAmount, factoryStatus.tokenDecimals)
    
    if (new BigNumber(amountInWei).isLessThanOrEqualTo(0)) {
      return setNewTokensAmountError(t('Amount must be greater than zero'))
    }
    if (new BigNumber(amountInWei).isGreaterThan(connectedWalletBalance)) {
      return setNewTokensAmountError(t('Amount is greater than your aviable token balance'))
    }
    setIsTokensSending(true)
    sendERC20({
      account,
      tokenAddress: factoryStatus.tokenAddress,
      to: factoryStatus.address,
      weiAmount: amountInWei,
    }).then((answer) => {
      console.log('>> answer', answer)
      setIsTokensAdded(true)
      setIsTokensSending(false)
      UpdateFactoryStatus()
    }).catch((err) => {
      setIsTokensSending(false)
      console.log('>err', err)
    })
  }

  const readyForSubmit = (!isBalanceFetching && !isBalanceFetchingError)
  return (
    <>
      <h3>AdminPanel - Add tokens</h3>
      <nav>
        <a href="#/admin/">[Back]</a>
      </nav>
      <div>
        {!isTokensAdded ? (
          <>
            <div className="adminForm">
              <header>{t('Add tokens to Factory contract')}</header>
              <div className="inputHolder">
                <label>{t('Tokens on QRFactory contract')}</label>
                <div className="infoRow">
                  {fromWei(factoryStatus.tokenBalance, factoryStatus.tokenDecimals)}
                  {` `}
                  <strong>{factoryStatus.tokenSymbol}</strong>
                </div>
              </div>
              <div className="inputHolder">
                <label>{t('Your aviabled tokens')}</label>
                <div className={`infoRow ${(isBalanceFetchingError) ? 'hasError' : ''}`}>
                  {isBalanceFetchingError ? (
                    <>
                      {t('Fail fetch active account balance')}
                    </>
                  ) : (
                    <>
                      {isBalanceFetching
                        ? t('Fetching balance')
                        : (
                          <>
                            {fromWei(connectedWalletBalance, factoryStatus.tokenDecimals)}
                            {` `}
                            <strong>{factoryStatus.tokenSymbol}</strong>
                          </>
                        )
                      }
                    </>
                  )}
                </div>
              </div>
              <div className="inputHolder">
                <label className="required">{t('Tokens amount for add')}</label>
                <input type="number" 
                  value={newTokensAmount}
                  className={(newTokensAmountError !== ``) ? 'hasError' : ''}
                  onChange={(e) => { setNewTokensAmount(e.target.value) }}
                />
                {newTokensAmountError != `` && (
                  <div className="error">{newTokensAmountError}</div>
                )}
              </div>
              <div className="buttonsHolder">
                <button
                  onClick={doAddTokens}
                  disabled={!readyForSubmit || isTokensSending}
                >
                  {(isTokensSending)
                    ? t('Adding tokens to contract')
                    : t('Add tokens to contract')
                  }
                </button>
                <button disabled={isTokensSending} onClick={() => { gotoPage('/admin/') }} className="isCancel">{t('Cancel')}</button>
              </div>
            </div>
          </>
        ) : (
          <div className="adminForm">
            <header>{t('Add tokens to Factory contract')}</header>
            <div className="inputHolder">
              <strong>{newTokensAmount}</strong>
              {` `}
              <strong>{factoryStatus.tokenSymbol}</strong>
              {` `}
              {t('tokens successfull added to contract')}
            </div>
            <div className="buttonsHolder">
              <button onClick={() => { gotoPage('/admin/') }} className="isGreen">
                {t('Go back')}
              </button>
            </div>
          </div>
        )}
        
      </div>
    </>
  )
}
