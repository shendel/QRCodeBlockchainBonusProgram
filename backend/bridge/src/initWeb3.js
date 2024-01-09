const WEB3 = require('web3')
const { getEthLikeWallet } = require('./getEthLikeWallet')

const MulticallAbi = require('./abi/MulticallAbi.json')
const BridgeContractData = require('./abi/SimpleERC20Bridge.json')

const initWeb3 = () => {
  const {
    FROM_CHAIN_ID,
    FROM_CHAIN_RPC,
    FROM_MULTICALL,
    FROM_CONTRACT,
    TO_CHAIN_ID,
    TO_CHAIN_RPC,
    TO_MULTICALL,
    TO_CONTRACT,
    ORACLE_SEED,
  } = process.env

  console.log(`>> Initing Web3 - from ${FROM_CHAIN_ID} to ${TO_CHAIN_ID}`)
  
  const wallet = getEthLikeWallet({ mnemonic: process.env.ORACLE_SEED })

  console.log('>>> Oracle Address:', wallet.address)
  
  console.log('>>> From RPC', FROM_CHAIN_RPC)
  const from_web3 = new WEB3(new WEB3.providers.HttpProvider(FROM_CHAIN_RPC))
  const from_account = from_web3.eth.accounts.privateKeyToAccount( wallet.privateKey )
  from_web3.eth.accounts.wallet.add( from_account.privateKey )

  console.log('>>> To RPC', TO_CHAIN_RPC)
  const to_web3 = new WEB3(new WEB3.providers.HttpProvider(TO_CHAIN_RPC))
  const to_account = from_web3.eth.accounts.privateKeyToAccount( wallet.privateKey )
  to_web3.eth.accounts.wallet.add( to_account.privateKey )
  
  console.log('>>> Web3 inited')
  
  console.log('>> Init main contracts')
  const from_multicall = new from_web3.eth.Contract(MulticallAbi, FROM_MULTICALL)
  
  console.log('>>> Multicall from inited', FROM_MULTICALL)
  
  const to_multicall = new to_web3.eth.Contract(MulticallAbi, TO_MULTICALL)
  console.log('>>> Multicall to inited', TO_MULTICALL)

  const from_bridge = new from_web3.eth.Contract(BridgeContractData.abi, FROM_CONTRACT)
  console.log('>>> Bridge contract from inited', FROM_CONTRACT)
  
  const to_bridge = new to_web3.eth.Contract(BridgeContractData.abi, TO_CONTRACT)
  console.log('>>> Bridge contract to inited', TO_CONTRACT)
  
  console.log('>>> Main contracts inited')

  return {
    from: {
      web3: from_web3,
      multicall: from_multicall,
      bridge: from_bridge,
      bridge_address: FROM_CONTRACT,
    },
    to: {
      web3: to_web3,
      multicall: to_multicall,
      bridge: to_bridge,
      bridge_address: TO_CONTRACT
    }
  }
}

module.exports = { initWeb3 }