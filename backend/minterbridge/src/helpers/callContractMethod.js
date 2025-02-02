const { calcSendArgWithFee } = require("./calcSendArgWithFee")

const callContractMethod = (options) => {
  return new Promise( async (resolve, reject) => {
    const {
      activeWeb3,
      activeWallet,
      contract,
      method,
      args,
      weiAmount
    } = options

    const onTrx = options.onTrx || (() => {})
    const onSuccess = options.onSuccess || (() => {})
    const onError = options.onError || (() => {})
    const onFinally = options.onFinally || (() => {})

    try {
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
          onSuccess(receipt)
        })
        .then((res) => {
          resolve(res)
          onFinally(res)
        }).catch((err) => {
          if(err.message.includes('not mined within')) {
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
    } catch (err) {
      onError(err)
      reject(err)
    }
  })
        
}

module.exports = { callContractMethod }
