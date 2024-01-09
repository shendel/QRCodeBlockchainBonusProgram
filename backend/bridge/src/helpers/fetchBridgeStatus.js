const BridgeContractData = require('../abi/SimpleERC20Bridge.json')
const { Interface: AbiInterface } = require('@ethersproject/abi')
const { callMulticall } = require('./callMulticall')

const fetchBridgeStatus = (options) => {
  const {
    address,
    multicall,
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
        tokenAddress: { func: 'token' },
        tokenName: { func: 'getTokenName' },
        tokenDecimals: { func: 'getTokenDecimals' },
        tokenSymbol: { func: 'getTokenSymbol' },
        tokenBalance: { func: 'getBalance' }
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

module.exports = { fetchBridgeStatus }