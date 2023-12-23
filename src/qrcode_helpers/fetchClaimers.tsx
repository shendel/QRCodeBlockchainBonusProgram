import QRFactoryContractData from "@/abi/QRCodeFactory.json"
import getMultiCall from '@/web3/getMultiCall'
import { Interface as AbiInterface } from '@ethersproject/abi'
import { callMulticall } from '@/helpers/callMulticall'

const fetchClaimers = (options) => {
  const {
    address,
    chainId,
    offset,
    limit,
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
        claimers: { func: 'getClaimersInfo', args: [offset, limit], asArray: true },
        totalCount: { func: 'getClaimersCount' },
      }
    }).then((answer) => {
      console.log('>> answer', answer)
      resolve({
        chainId,
        address,
        offset,
        limit,
        ...answer
      })
    }).catch((err) => {
      console.log('>> call mc err', err)
      reject(err)
    })
  })
}

export default fetchClaimers