import SimpleERC20Bridge from "@/abi/SimpleERC20Bridge.json"
import Web3 from 'web3'
import { calcSendArgWithFee } from "@/helpers/calcSendArgWithFee"
import { BigNumber } from 'bignumber.js'

const callBridgeMethod = (options) => {
  return new Promise(async (resolve, reject) => {
    const {
      activeWallet,
      activeWeb3,
      contractAddress,
      method,
      args,
      weiAmount
    } = options

    const onTrx = options.onTrx || (() => {})
    const onSuccess = options.onSuccess || (() => {})
    const onError = options.onError || (() => {})
    const onFinally = options.onFinally || (() => {})


    const contract = new activeWeb3.eth.Contract(SimpleERC20Bridge.abi, contractAddress)

    const sendArgs = await calcSendArgWithFee(
      activeWallet,
      contract,
      method,
      args || [],
      weiAmount
    )
    const gasPrice = await activeWeb3.eth.getGasPrice()
    sendArgs.gasPrice = gasPrice

    contract.methods[method](...(args || []))
      .send(sendArgs)
      .on('transactionHash', (hash) => {
        console.log('transaction hash:', hash)
        onTrx(hash)
      })
      .on('error', (error) => {
        console.log('transaction error:', error)
        onError(error)
        reject(error)
      })
      .on('receipt', (receipt) => {
        console.log('transaction receipt:', receipt)
        onSuccess(receipt)
      })
      .then((res) => {
        resolve(res)
        onFinally(res)
      })
  })
        
}


export default callBridgeMethod