const WEB3 = require('web3')
const { getEthLikeWallet } = require('./getEthLikeWallet')

const initWeb3 = () => {
  const rpc = process.env.RPC
  console.log('>>> Initing Web3 on ', rpc)
  
  const web3 = new WEB3(new WEB3.providers.HttpProvider(rpc))
  const wallet = getEthLikeWallet({ mnemonic: process.env.SEED })
  
  console.log('>>> Account: ', wallet.address)

  const account = web3.eth.accounts.privateKeyToAccount( wallet.privateKey )
  web3.eth.accounts.wallet.add( account.privateKey )
  
  console.log('>>> Web3 inited')
  return web3
}

module.exports = { initWeb3 }