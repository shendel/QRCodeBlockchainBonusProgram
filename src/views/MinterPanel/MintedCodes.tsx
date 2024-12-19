import { useEffect, useState, Component } from "react"
import { useBrowserWeb3 } from '@/web3/BrowserWeb3Provider'
import styles from './MintedCodes.module.scss'
import fetchMinterInfo from '@/qrcode_helpers/fetchMinterInfo'
import HeaderRow from '@/components/qrcode/HeaderRow/'
import LoaderFullScreen from '@/components/qrcode/LoaderFullScreen'
import fetchMinterQrCodes from '@/qrcode_helpers/fetchMinterQrCodes'


import {
  PROJECT_TITLE,
  QRCODE_FACTORY,
  WORK_CHAIN_ID
} from '@/config'


const perPage = 10


export default function MinterMintedCodes(props) {
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
    }).then((answer) => {
      console.log('>>> minter codes', codesTypes, codesPage)
      setIsCodesListFetched(true)
      setIsMinterInfoFetching(false)
    }).catch((err) => {
      setIsCodesListFetching(false)
      setIsCodesListFetchError(true)
    })
  }, [ minterInfo, codesTypes, codesPage ])
  
  return (
    <div className={styles.test}>
      <HeaderRow title={PROJECT_TITLE} backUrl={`/minter`} gotoPage={gotoPage} />
      {isMinterInfoFetching && (<LoaderFullScreen />)}
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
            </table>
          </div>
        </div>
      )}
    </div>
  )
}