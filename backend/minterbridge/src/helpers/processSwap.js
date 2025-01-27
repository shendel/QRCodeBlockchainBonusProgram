const { fetchSwapOut } = require('./fetchSwapOut')
const { callContractMethod } = require('./callContractMethod')

const processSwap = (options) => {
  const {
    from,
    from: {
      bridge_address,
      bridge,
      multicall
    },
    oracleAddress,
    to,
    swapId
  } = options

  return new Promise((resolve, reject) => {
    fetchSwapOut({
      address: from.bridge_address,
      multicall,
      swapId,
    }).then((answer) => {
      if (answer && answer.swapInfo && answer.swapInfo.swapId == swapId) {
        const { swapInfo } = answer
        if (!swapInfo.swapped && !swapInfo.refunded) {
          callContractMethod({
            activeWeb3: to.web3,
            activeWallet: oracleAddress,
            contract: to.bridge,
            method: 'swapIn',
            args: [
              swapId,
              swapInfo.fromAddress,
              swapInfo.toAddress,
              swapInfo.amount
            ]
          }).then((answer) => {
            console.log('swapIn ok')
            const { transactionHash } = answer
            console.log('>>> In hash', transactionHash)
            callContractMethod({
              activeWeb3: from.web3,
              activeWallet: oracleAddress,
              contract: from.bridge,
              method: 'swapOutReady',
              args: [
                swapId,
                transactionHash
              ],
            }).then((answer) => {
              console.log('>>> Ready')
              resolve(true)
            }).catch((err) => {
              console.log('Fail swapOutReady')
              console.error(err)
              reject(err)
            })
          }).catch((err) => {
            console.log('[Fail swapIn]', swapId, err.message)
            if (err.message == 'Returned error: execution reverted: Swap already in') {
              console.log('>> Try swapOutReady')
              reject('ALREADY_IN')
              return
            }
            reject(err)
          })
        } else {
          if (swapInfo.swapped) {
            console.log('Already swapped', swapId, swapInfo.inHash)
          }
          if (swapInfo.refunded) {
            console.log('Swap is refunded')
          }
          reject(false)
        }
      } else {
        console.log('>> Fail - swap not founded', answer)
        reject(false)
      }
    }).catch((err) => {
      console.log('>> Fail fetch swapOut info', swapId)
      console.error(err)
      reject(err)
    })
  })
}

module.exports = { processSwap }
