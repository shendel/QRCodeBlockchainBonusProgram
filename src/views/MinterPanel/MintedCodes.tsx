import { useEffect, useState, Component } from "react"
import { useBrowserWeb3 } from '@/web3/BrowserWeb3Provider'
import styles from './MintedCodes.module.scss'
import fetchMinterInfo from '@/qrcode_helpers/fetchMinterInfo'
import HeaderRow from '@/components/qrcode/HeaderRow/'
import LoaderFullScreen from '@/components/qrcode/LoaderFullScreen'
import Paginator from '@/components/qrcode/Paginator'
import Title from '@/components/qrcode/Title'
import fetchMinterQrCodes from '@/qrcode_helpers/fetchMinterQrCodes'
import { getTranslate } from '@/translate'
import { fromWei } from '@/helpers/wei'

import {
  PROJECT_TITLE,
  QRCODE_FACTORY,
  WORK_CHAIN_ID
} from '@/config'


const perPage = 3


export default function MinterMintedCodes(props) {
  const t = getTranslate('MINTER_QRCODES')
  const {
    gotoPage,
    factoryStatus,
    on404,
    params: {
      type: codesTypes,
      page: codesPage,
    }
  } = props

  if (['all','claimed'].indexOf(codesTypes) === -1) return on404()
  if (!(Number(codesPage) >= 0)) return on404()
  
  console.log('>>> PROPS', props, factoryStatus)

  const {
    browserWeb3,
    browserAccount
  } = useBrowserWeb3()
 
  const [ currentTimestamp, setCurrentTimestamp ] = useState(0)
  useEffect(() => {
    browserWeb3.eth.getBlock('latest').then(({ timestamp }) => {
      setCurrentTimestamp(timestamp)
    })
  }, [ browserWeb3 ])

  const [ minterInfo, setMinterInfo ] = useState(false)
  const [ isMinterInfoFetching, setIsMinterInfoFetching ] = useState(true)
  const [ isMinterInfoFetched, setIsMinterInfoFetched ] = useState(false)
  const [ isMinterInfoFetchError, setIsMinterInfoFetchError ] = useState(false)
  
  useEffect(() => {
    setIsMinterInfoFetched(false)
    setIsMinterInfoFetching(true)
    setIsMinterInfoFetchError(false)
    fetchMinterInfo({
      address: QRCODE_FACTORY,
      chainId: WORK_CHAIN_ID,
      minter: browserAccount,
    }).then(({ info }) => {
      console.log('minter info', info, factoryStatus)
      setMinterInfo(info)
      setIsMinterInfoFetched(true)
      setIsMinterInfoFetching(false)
    }).catch((err) => {
      console.log('>Error', err)
      setIsMinterInfoFetchError(true)
      setIsMinterInfoFetching(false)
    })
  }, [ browserAccount ])
  
  const [ codesList, setCodesList ] = useState([])
  const [ totalCount, setTotalCount ] = useState(0)
  const [ isCodesListFetching, setIsCodesListFetching ] = useState(true)
  const [ isCodesListFetched, setIsCodesListFetched ] = useState(false)
  const [ isCodesListFetchError, setIsCodesListFetchError ] = useState(false)
  
  
  useEffect(() => {
    setTotalCount((codesTypes == 'all') ? minterInfo.mintedQrCodesCount : minterInfo.claimedQrCodesCount)
    setIsCodesListFetching(true)
    setIsCodesListFetched(false)
    setIsCodesListFetchError(false)
    fetchMinterQrCodes({
      address: QRCODE_FACTORY,
      chainId: WORK_CHAIN_ID,
      minter: browserAccount,
      offset: (Number(codesPage) * perPage),
      limit: perPage,
      qrsType: codesTypes,
    }).then(({ qrcodes }) => {
      setCodesList(qrcodes)
      setIsCodesListFetched(true)
      setIsCodesListFetching(false)
    }).catch((err) => {
      setIsCodesListFetching(false)
      setIsCodesListFetchError(true)
    })
  }, [ minterInfo, codesTypes, codesPage ])

  const hasPaginator = (totalCount > perPage)
  return (
    <div className={styles.mintedQrCodesHolder}>
      <HeaderRow title={PROJECT_TITLE} backUrl={`/minter`} gotoPage={gotoPage} />
      {(isMinterInfoFetching || isCodesListFetching) && (<LoaderFullScreen />)}
      <Title title={(codesTypes == 'all') ? t('Your minted QRCodes') : t('Your claimed QRCodes')} />
      {isMinterInfoFetched && (
        <div>
          <div className="adminTable">
            <table>
              <thead>
                <tr>
                  <td>#</td>
                  <td>Amount</td>
                  <td>Date</td>
                  <td>Status</td>
                </tr>
              </thead>
              <tbody>
                {(codesList && codesList.length) ? (
                  <>
                    {codesList.map((qrcode) => {
                      const {
                        id,
                        amount,
                        claimed_at,
                        minted_at,
                        timelife,
                      } = qrcode

                      console.log('>> QRCODE', id, minted_at, timelife, currentTimestamp)

                      return (
                        <tr key={qrcode.id}>
                          <td>{qrcode.id}</td>
                          <td>{fromWei(qrcode.amount, factoryStatus.tokenDecimals)}</td>
                          <td>
                            {(Number(claimed_at) !== 0) ? claimed_at : minted_at}
                          </td>
                          <td>
                            {(Number(claimed_at) !== 0) ? (
                              <em>Claimed</em>
                            ) : (
                              <>
                                {(new Date((Number(minted_at) + Number(timelife)) * 1000) > new Date()) ? (
                                  <em>Valid</em>
                                ) : (
                                  <em>Expired</em>
                                )}
                              </>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </>
                ) : (
                  <tr>
                    <td colSpan="4" align="center">Empty</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <Paginator
            page={codesPage}
            totalItems={totalCount}
            perPage={perPage}
            href={`#/minter/codes/${codesTypes}/{page}`}
          />
        </div>
      )}
    </div>
  )
}