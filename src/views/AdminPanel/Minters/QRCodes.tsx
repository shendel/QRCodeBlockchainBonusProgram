
import { useEffect, useState, Component } from "react"
import { getAssets } from '@/helpers/getAssets'
import { getTranslate } from '@/translate'
import { fromWei } from '@/helpers/wei'
import { WORK_CHAIN_ID, QRCODE_FACTORY } from '@/config'
import fetchMinterQrCodes from '@/qrcode_helpers/fetchMinterQrCodes'

import { getUnixTimestamp } from '@/helpers/getUnixTimestamp'
import { shortAddress } from '@/helpers/shortAddress'
import { getDateTimeFromBlock } from '@/helpers/getDateTimeFromBlock'

import Paginator from '@/components/Paginator'


const t = getTranslate('MINTER_QRCODES')


export default function AdminPanelMintersQrCodes(props) {
  const {
    gotoPage,
    factoryStatus,
    params: {
      minterAddress,
      page,
    },
  } = props
  const perPage = 10;

  const [ pagesTotal, setPagesTotal ] = useState(0)

  const [ qrCodes, setQrCodes ] = useState([])
  const [ isQrCodesFetching, setIsQrCodesFetching ] = useState(false)
  const [ totalQrCodesCount, setTotalQrCodesCount ] = useState(0)

  useEffect(() => {
    if (factoryStatus && minterAddress) {
      setIsQrCodesFetching(true)
      fetchMinterQrCodes({
        address: QRCODE_FACTORY,
        chainId: WORK_CHAIN_ID,
        minter: minterAddress,
        offset: page * perPage,
        limit: perPage,
      }).then((answer) => {
        console.log('>>> answer', answer)
        setQrCodes(answer.qrcodes)
        setTotalQrCodesCount(answer.totalCount)
        setIsQrCodesFetching(false)
        setPagesTotal(Math.ceil(answer.totalCount / perPage))
      }).catch((err) => {
        console.log('>>> fail', err)
        setIsQrCodesFetching(false)
      })
    }
  }, [ factoryStatus, minterAddress, page ])

  return (
    <>
      <h3>AdminPanel - Minters - QrCodes</h3>
      <nav>
        <span>---</span>
      </nav>
      <div className={`adminTable ${(isQrCodesFetching) ? 'isLoading' : ''}`}>
        <table>
          <thead>
            <tr>
              <td>{t(`ID`)}</td>
              <td>{t(`Amount {tokenSymbol}`, { tokenSymbol : factoryStatus.tokenSymbol })}</td>
              <td>{t(`Minted At`)}</td>
              <td>{t(`Status`)}</td>
              <td>{t(`Message`)}</td>
              <td></td>
            </tr>
          </thead>
          <tbody>
            {qrCodes.length > 0 ? (
              <>
                {qrCodes.map((qrCode, key) => {
                  const {
                    id,
                    amount,
                    claimed_at,
                    claimer,
                    message,
                    minted_at,
                    minter,
                    router,
                    timelife,
                  } = qrCode
                  

                  return (
                    <tr key={key}>
                      <td>
                        <span>{id}</span>
                        <div>{shortAddress(router)}</div>
                      </td>
                      <td>
                        {fromWei(amount, factoryStatus.tokenDecimals)}
                      </td>
                      <td>
                        {getDateTimeFromBlock(minted_at)}
                      </td>
                      <td>
                        {claimed_at != "0" ? (
                          <div>{t('Claimed by {claimer}', { claimer: shortAddress(claimer) })}</div>
                        ) : (
                          <>
                            {(new Date((Number(minted_at) + Number(timelife)) * 1000) < new Date()) ? (
                              <div>{t('Expired')}</div>
                            ) : (
                              <>
                                <div>{t('Valid')}</div>
                                <div>{getDateTimeFromBlock(Number(minted_at) + Number(timelife))}</div>
                              </>
                            )}
                          </>
                        )}
                      </td>
                      <td>{message}</td>
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
        totalItems={totalQrCodesCount}
        perPage={perPage}
        page={page}
        href={`#/admin//minters/qrcodes/${minterAddress}/{page}`}
      />
    </>
  )
}
