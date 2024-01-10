const fetchBalance = ({ address, multicall } = options) => {
  return new Promise((resolve, reject) => {
    multicall.methods.getEthBalance(address).call().then((balance) => {
      resolve(balance)
    }).catch((err) => {
      reject(err)
    })
  })
}

module.exports = { fetchBalance }