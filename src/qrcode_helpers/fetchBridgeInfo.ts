import SimpleERC20Bridge from "@/abi/SimpleERC20Bridge.json"
import getMultiCall from '@/web3/getMultiCall'
import { Interface as AbiInterface } from '@ethersproject/abi'
import { callMulticall } from '@/helpers/callMulticall'

const fetchBridgeInfo = (options) => {
  const {
    address,
    chainId,
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
        owner: { func: 'owner' },
        oracle: { func: 'oracle' },
        tokenAddress: { func: 'token' },
        tokenName: { func: 'getTokenName' },
        tokenSymbol: { func: 'getTokenSymbol' },
        tokenDecimals: { func: 'getTokenDecimals' },
        tokenBalance: { func: 'getBalance' }
      }
    }).then((answer) => {
      console.log('>> answer', answer)
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

export default fetchBridgeInfo