import TokenAbi from 'human-standard-token-abi'
import Web3 from 'web3'
import { calcSendArgWithFee } from "@/helpers/calcSendArgWithFee"
import { BigNumber } from 'bignumber.js'

const approveToken = (options) => {
  return new Promise(async (resolve, reject) => {
    const {
      activeWallet,
      activeWeb3,
      tokenAddress,
      approveFor,
      weiAmount
    } = options

    const onTrx = options.onTrx || (() => {})
    const onSuccess = options.onSuccess || (() => {})
    const onError = options.onError || (() => {})
    const onFinally = options.onFinally || (() => {})

    const contract = new activeWeb3.eth.Contract(TokenAbi, tokenAddress)

    const sendArgs = await calcSendArgWithFee(
      activeWallet,
      contract,
      'approve',
      [ approveFor, weiAmount ]
    )
    const gasPrice = await activeWeb3.eth.getGasPrice()
    sendArgs.gasPrice = gasPrice

    contract.methods['approve'](...([ approveFor, weiAmount ]))
      .send(sendArgs)
      .on('transactionHash', (hash) => {
        onTrx(hash)
      })
      .on('error', (error) => {
        onError(error)
        reject(error)
      })
      .on('receipt', (receipt) => {
        onSuccess(receipt)
      })
      .then((res) => {
        resolve(res)
        onFinally(res)
      })
  })
}


export default approveToken