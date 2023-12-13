import Web3 from 'web3'
import MulticallAbi from '../contracts/MulticallAbi.json'

import { MULTICALL_CONTRACTS } from './constants'
import { CHAIN_INFO } from "./constants"
import { callMulticall } from './callMulticall'


const fetchBalance = ({ address, chainId } = options) => {
  return new Promise((resolve, reject) => {
    const chainInfo = CHAIN_INFO(chainId)
    if (chainInfo && chainInfo.rpcUrls) {
      try {
        const web3 = new Web3(chainInfo.rpcUrls[0])

        const multicall = new web3.eth.Contract(MulticallAbi, MULTICALL_CONTRACTS[chainId])
        multicall.methods.getEthBalance(address).call().then((balance) => {
          resolve(balance)
        }).catch((err) => {
          reject(err)
        })
      } catch (err) {
        reject(err)
      }
    } else {
      reject(`NOT_SUPPORTED_CHAIN`)
    }
  })
}

export default fetchBalance