import SimpleERC20Bridge from "@/abi/BonusBridge.json"
import Web3 from 'web3'
import { calcSendArgWithFee } from "@/helpers/calcSendArgWithFee"
import { BigNumber } from 'bignumber.js'

const callMinterBridgeMethod = (options) => {
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
    
    let txHash
    
    contract.methods[method](...(args || []))
      .send(sendArgs)
      .on('transactionHash', (hash) => {
        txHash = hash
        console.log('transaction hash:', hash)
        onTrx(hash)
      })
      .on('error', (error) => {
        if (!error.toString().includes('not mined within')) {
          console.log('>>> on error', error)
          onError(error)
          reject(error)
        } else {
          console.log('>>> wail wait')
        }
      })
      .on('receipt', (receipt) => {
        console.log('transaction receipt:', receipt)
        onSuccess(receipt)
      })
      .then((res) => {
        resolve(res)
        onFinally(res)
      }).catch((err) => {
        console.error(err)
        if(err.message.includes('not mined within')) {
          console.log('>>> NOT MINTED IN 50 BLOCKS - WAIT MINT!!!')
          const handle = setInterval(() => {
            activeWeb3.eth.getTransactionReceipt(txHash).then((resp) => {
              // @to-do - process logs
              if(resp != null && resp.blockNumber > 0) {
                clearInterval(handle)
                resolve(resp)
                onSuccess(resp)
              }
            })
          }, 1000)
        } else {
          onError(err)
          reject(err)
        }
      })
  })
        
}


export default callMinterBridgeMethod