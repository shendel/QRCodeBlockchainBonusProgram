import BonusBridge from "@/abi/BonusBridge.json"
import getMultiCall from '@/web3/getMultiCall'
import { Interface as AbiInterface } from '@ethersproject/abi'
import { callMulticall } from '@/helpers/callMulticall'

const fetchMinterBridgeInfo = (options) => {
  const {
    workAddress,
    workChainId,
    mainAddress,
    mainChainId,
  } = {
    ...options
  }
  return new Promise((resolve, reject) => {
    const encoder = new AbiInterface(BonusBridge.abi)
    const mcWork = getMultiCall(workChainId)
    const mcMain = getMultiCall(mainChainId)
    
    callMulticall({
      multicall: mcMain,
      target: mainAddress,
      encoder,
      calls: {
        oracle: { func: 'oracle' },
        outToInRate: { func: 'outToInRate' },
        outTokenDecimals: { func: 'outTokenDecimals' },
        inTokenDecimals: { func: 'inTokenDecimals' },
        tokenAddress: { func: 'token' }
      }
    }).then((mainAnswer) => {
      console.log('>> mainAnswer', mainAnswer)
      callMulticall({
        multicall: mcWork,
        target: workAddress,
        encoder,
        calls: {
          oracle: { func: 'oracle' },
          outToInRate: { func: 'outToInRate' },
          outTokenDecimals: { func: 'outTokenDecimals' },
          inTokenDecimals: { func: 'inTokenDecimals' },
          tokenAddress: { func: 'token' }
        }
      }).then((workAnswer) => {
        resolve({
          mainAddress,
          mainChainId,
          workAddress,
          workChainId,
          main: mainAnswer,
          work: workAnswer,
          isValid: (
            mainAnswer.outToInRate == workAnswer.outToInRate
            && mainAnswer.outTokenDecimals == workAnswer.outTokenDecimals
            && mainAnswer.inTokenDecimals == workAnswer.inTokenDecimals
          )
        })
      }).catch((err) => {
        console.log('>> call mc err', err)
        reject(err)
      })
    }).catch((err) => {
      console.log('>> call mc err', err)
      reject(err)
    })
  })
}

export default fetchMinterBridgeInfo