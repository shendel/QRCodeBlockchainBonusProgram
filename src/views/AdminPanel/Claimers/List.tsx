
import { useEffect, useState, Component } from "react"
import { getAssets } from '@/helpers/getAssets'
import { getTranslate } from '@/translate'
import { fromWei } from '@/helpers/wei'
import { WORK_CHAIN_ID, QRCODE_FACTORY } from '@/config'
import fetchClaimers from '@/qrcode_helpers/fetchClaimers'

import { getUnixTimestamp } from '@/helpers/getUnixTimestamp'
import { shortAddress } from '@/helpers/shortAddress'
import { getDateTimeFromBlock } from '@/helpers/getDateTimeFromBlock'

import Paginator from '@/components/Paginator'


const t = getTranslate('CLAIMERS')


export default function AdminPanelClaimers(props) {
  const {
    gotoPage,
    factoryStatus,
    params: {
      page,
    },
  } = props
  const perPage = 10;

  const [ isFetching, setIsFetching ] = useState(false)
  const [ claimers, setClaimers ] = useState([])
  const [ totalClaimers, setTotalClaimers ] = useState(0)
  
  useEffect(() => {
    if (factoryStatus) {
      setIsFetching(true)
      fetchClaimers({
        address: QRCODE_FACTORY,
        chainId: WORK_CHAIN_ID,
        offset: page * perPage,
        limit: perPage
      }).then((answer) => {
        console.log('>>> answer', answer)
        setClaimers(answer.claimers)
        setTotalClaimers(answer.totalCount)
        setIsFetching(false)
      }).catch((err) => {
        console.log('>>> err', err)
        setIsFetching(false)
      })
    }
  }, [ factoryStatus, page ])

  return (
    <>
      <h3>AdminPanel - Claimers </h3>
      <nav>
        <span>---</span>
      </nav>
      <div className={`adminTable ${(isFetching) ? 'isLoading' : ''}`}>
        <table>
          <thead>
            <tr>
              <td>{t(`Address`)}</td>
              <td>{t(`Claimed amount {tokenSymbol}`, { tokenSymbol : factoryStatus.tokenSymbol })}</td>
              <td>{t(`Calimed QR-Codes`)}</td>
              <td>{t(`Energy`)}</td>
              <td>{t(`Is banned`)}</td>
              <td></td>
            </tr>
          </thead>
          <tbody>
            {claimers.length > 0 ? (
              <>
                {claimers.map((claimer, key) => {
                  const {
                    claimerAddress,
                    claimedAmount,
                    claimedQrCodesCount,
                    faucetUsed,
                    isBanned,
                  } = claimer

                  return (
                    <tr key={key}>
                      <td>
                        <div>{claimerAddress}</div>
                      </td>
                      <td>
                        <div>{fromWei(claimedAmount, factoryStatus.tokenDecimals)}</div>
                      </td>
                      <td>
                        <div>{claimedQrCodesCount}</div>
                      </td>
                      <td>
                        <div>{fromWei(faucetUsed)}</div>
                      </td>
                      <td>
                        <div>{(isBanned == "1") ? (t('Yes')) : ``}</div>
                      </td>
                      <td></td>
                    </tr>
                  )
                })}
              </>
            ) : (
              <tr>
                <td colSpan="6" align="center">{t(`empty`)}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Paginator
        totalItems={totalClaimers}
        perPage={perPage}
        page={page}
        href={`#/admin/claimers/{page}`}
      />
    </>
  )
}
