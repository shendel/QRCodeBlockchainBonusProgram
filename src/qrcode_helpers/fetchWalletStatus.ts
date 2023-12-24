import fetchBalance from '@/helpers/fetchBalance'
import fetchTokenBalance from '@/helpers/fetchTokenBalance'

const fetchWalletStatus = ({ address, tokenAddress, chainId }) => {
  return new Promise((resolve, reject) => {
    fetchBalance({
      address,
      chainId,
    }).then((balance) => {
      fetchTokenBalance({
        wallet: address,
        chainId,
        tokenAddress,
      }).then((answer) => {
        resolve({
          address,
          energy: balance,
          balance: answer.wei
        })
      }).catch((err) => {
        console.log('>> err', err)
        reject(err)
      })
    }).catch((err) => {
      console.log('>> err', err)
      reject(err)
    })
  })
}

export default fetchWalletStatus