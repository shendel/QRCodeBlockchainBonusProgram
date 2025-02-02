const BridgeContractData = require('../abi/BonusBridge.json')
const { Interface: AbiInterface } = require('@ethersproject/abi')
const { callMulticall } = require('./callMulticall')

const fetchSwapOut = (options) => {
  const {
    address,
    multicall,
    swapId
  } = {
    ...options
  }
  return new Promise((resolve, reject) => {
    const abiI = new AbiInterface(BridgeContractData.abi)
    callMulticall({
      multicall,
      target: address,
      encoder: abiI,
      calls: {
        swapInfo: { func: 'swapsOut', args: [ swapId ] },
      }
    }).then((answer) => {
      resolve({
        address,
        ...answer,
      })
    }).catch((err) => {
      console.log('>> call mc err', err)
      reject(err)
    })
  })
}

module.exports = { fetchSwapOut }