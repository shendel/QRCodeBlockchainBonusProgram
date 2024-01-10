import SimpleERC20Bridge from "@/abi/SimpleERC20Bridge.json"
import getMultiCall from '@/web3/getMultiCall'
import { Interface as AbiInterface } from '@ethersproject/abi'
import { callMulticall } from '@/helpers/callMulticall'

const fetchBridgeSwapInfo = (options) => {
  const {
    address,
    chainId,
    swapId
  } = {
    ...options
  }
  return new Promise((resolve, reject) => {
    const multicall = getMultiCall(chainId)
    const abiI = new AbiInterface(SimpleERC20Bridge.abi)
    callMulticall({
      multicall,
      target: address,
      encoder: abiI,
      calls: {
        info: { func: 'swapsOut', args: [ swapId ]},
      }
    }).then((answer) => {
      resolve({
        chainId,
        address,
        ...answer
      })
    }).catch((err) => {
      console.log('>> call mc err', err)
      reject(err)
    })
  })
}

export default fetchBridgeSwapInfo