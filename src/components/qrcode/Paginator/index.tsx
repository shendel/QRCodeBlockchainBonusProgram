import { getTranslate } from '@/translate'
import styles from './index.module.scss'


export default function Paginator(props) {
  const t = getTranslate('QRCODE_PAGINATOR')
  const {
    page: _page,
    totalItems,
    perPage,
    href
  } = props
  const curPage = Number(_page)
  const pagesTotal = Math.ceil(totalItems / perPage)
  
  console.log('>>>> Paginator', totalItems, perPage, pagesTotal)
  const pageTab = (page) => {
    return (
      <a href={href.replace('{page}', page)} className={(page == curPage) ? styles.active : ''}>
        {(page+1)}
      </a>
    )
  }
  if (pagesTotal > 1) {
    return (
      <div className={styles.paginator}>
        <div className={styles.pageInfo}>
          {t('Showing {from} to {to} of {total} results', {
            from: curPage*perPage +1,
            to: (curPage*perPage + perPage) > totalItems ? totalItems : (curPage*perPage + perPage),
            total: totalItems
          })}
        </div>
        <div className={styles.pages}>
          {pagesTotal > 10 ? (
            <>
              {(Array.apply(null, Array((curPage >= 4) ? 2 : 6))).map((empty, page) => {
                return pageTab(page)
              })}
              {(curPage >=4 && (curPage <= (pagesTotal - 6))) ? (
                <>
                  <span>...</span>
                  {pageTab(curPage-1)}
                  {pageTab(curPage)}
                  {pageTab(curPage+1)}
                  {(curPage < (pagesTotal - 5)) && (<span>...</span>)}
                </>
              ) : (
                <>
                  <span>...</span>
                </>
              )}
              <>
                {curPage > (pagesTotal - 6) && (<>{pageTab(pagesTotal -6)}</>)}
                {curPage > (pagesTotal - 6) && (<>{pageTab(pagesTotal -5)}</>)}
                {curPage > (pagesTotal - 6) && (<>{pageTab(pagesTotal -4)}</>)}
                {curPage > (pagesTotal - 6) && (<>{pageTab(pagesTotal -3)}</>)}
                {pageTab(pagesTotal -2)}
                {pageTab(pagesTotal -1)}
              </>
            </>
          ) : (
            <>
              {(Array.apply(null, Array(pagesTotal)).map(function () {})).map((empty, page) => {
                return pageTab(page)
              })}
            </>
          )}
        </div>
      </div>
    )
  }
  return null
}