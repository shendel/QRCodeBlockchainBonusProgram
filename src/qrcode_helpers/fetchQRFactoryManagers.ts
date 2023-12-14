import QRFactoryContractData from "@/abi/QRCodeFactory.json"
import getMultiCall from '@/web3/getMultiCall'
import { Interface as AbiInterface } from '@ethersproject/abi'
import { callMulticall } from '@/helpers/callMulticall'

const fetchQRFactoryManagers = (options) => {
  const {
    address,
    chainId,
  } = {
    ...options
  }
  return new Promise((resolve, reject) => {
    const multicall = getMultiCall(chainId)
    const abiI = new AbiInterface(QRFactoryContractData.abi)
    callMulticall({
      multicall,
      target: address,
      encoder: abiI,
      calls: {
        managers: { func: 'getManagers', asArray: true}
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

export default fetchQRFactoryManagers