import QRCodeClaimerContractData from "@/abi/QRCodeClaimer.json"
import getMultiCall from '@/web3/getMultiCall'
import { Interface as AbiInterface } from '@ethersproject/abi'
import { callMulticall } from '@/helpers/callMulticall'
import { getUnixTimestamp } from '@/helpers/getUnixTimestamp'

const fetchQRCodeInfo = (options) => {
  const {
    address,
    chainId,
  } = {
    ...options
  }
  return new Promise((resolve, reject) => {
    const multicall = getMultiCall(chainId)
    const abiI = new AbiInterface(QRCodeClaimerContractData.abi)
    callMulticall({
      multicall,
      target: address,
      encoder: abiI,
      calls: {
        factory: { func: 'factory' },
        token: { func: 'token' },
        minter: { func: 'minter' },
        amount: { func: 'amount' },
        name: { func: 'name' },
        symbol: { func: 'symbol' },
        decimals: { func: 'decimals' },
        minterName: { func: 'minterName' },
        message: { func: 'message' },
        isValidBlockchain: { func: 'isValid' },
        isClaimed: { func: 'isClaimed' },
        created_at: { func: 'created_at' },
        timelife: { func: 'timelife' },
      }
    }).then((answer) => {
      console.log('>> QrCode', answer)
      // У нас ленивая сеть, блоки майнит только когда есть транзакции
      // Из-за этого нельзя полагаться на ответы view, которые из block.timestamp
      const utx = getUnixTimestamp()
      const isValid = ((Number(answer.created_at) + Number(answer.timelife)) > utx)
      resolve({
        chainId,
        address,
        isValid,
        ...answer
      })
    }).catch((err) => {
      console.log('>> call mc err', err)
      reject(err)
    })
  })
}

export default fetchQRCodeInfo