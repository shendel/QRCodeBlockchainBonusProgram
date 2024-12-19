import QRFactoryContractData from "@/abi/QRCodeFactory.json"
import getMultiCall from '@/web3/getMultiCall'
import { Interface as AbiInterface } from '@ethersproject/abi'
import { callMulticall } from '@/helpers/callMulticall'

const fetchMinterQrCodes = (options) => {
  const {
    address,
    chainId,
    minter,
    offset,
    limit,
    qrsType,
  } = {
    qrsType: 'all',
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
        qrcodes: {
          func: (qrsType == 'claimed') ? 'getMinterClimedQrCodes' : 'getMinterQrCodes',
          args: [minter, offset, limit],
          asArray: true
        },
      }
    }).then((answer) => {
      console.log('>> answer', answer)
      resolve({
        chainId,
        address,
        minter,
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

export default fetchMinterQrCodes