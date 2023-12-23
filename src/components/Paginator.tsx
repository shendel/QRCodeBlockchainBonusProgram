
export default function Paginator(props) {
  const {
    page: curPage,
    totalItems,
    perPage,
    href
  } = props
  
  const pagesTotal = Math.ceil(totalItems / perPage)
  
  if (pagesTotal > 1) {
    return (
      <>
        {(Array.apply(null, Array(pagesTotal)).map(function () {})).map((empty, page) => {
          return (
            <a href={href.replace('{page}', page)}>
              [
                {(page == curPage) && (<>*</>)}
                {(page+1)}
                {(page == curPage) && (<>*</>)}
              ]
            </a>
          )
        })}
      </>
    )
  }
  return null
}