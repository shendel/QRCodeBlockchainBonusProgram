import QRCodeClaimerContractData from "@/abi/QRCodeFactory.json"
import Web3 from 'web3'
import { calcSendArgWithFee } from "@/helpers/calcSendArgWithFee"
import { BigNumber } from 'bignumber.js'

const callQRCoreMethod = (options) => {
  return new Promise((resolve, reject) => {
    const {
      account,
      contractAddress,
      method,
      args,
      weiAmount
    } = options
    const onTrx = options.onTrx || (() => {})
    const onSuccess = options.onSuccess || (() => {})
    const onError = options.onError || (() => {})
    const onFinally = options.onFinally || (() => {})

    account.connector.getProvider().then(async (provider) => {
      const activeWallet = account.address
      const activeWeb3 = new Web3(provider)
      const contract = new activeWeb3.eth.Contract(QRCodeClaimerContractData.abi, contractAddress)

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
    }).catch((err) => {
      console.log('>>> callQRCoreMethod', err)
      reject(err)
    })
  })
        
}


export default callQRCoreMethod