require("dotenv").config()

const { fetchBridgeStatus } = require('./helpers/fetchBridgeStatus')
const { fromWei, toWei } = require('./helpers/wei')
const { BigNumber } = require('bignumber.js')

const server_port = process.env.SERVER_PORT
const server_ip = process.env.SERVER_IP

const cors = require("cors")
const express = require("express")
const app = express()

const { initWeb3 } = require("./initWeb3")

app.use(cors())
app.use('/status', async(req, res) => {
  res.json({ answer: 'ok' })
})

/*
app.listen(server_port, server_ip, () => {
  console.log(`Bridge backend status info started at http://${server_ip}:${server_port}`)
})
*/

const mainLoop = async () => {
  console.log('> Start main loop')

  const activeWeb3 = initWeb3()

  console.log('> Bridge from - fetch contract status')
  const fromStatus = await fetchBridgeStatus({
    address: activeWeb3.from.bridge_address,
    multicall: activeWeb3.from.multicall,
  })
  console.log('>> Token address:', fromStatus.tokenAddress)
  console.log('>>>> Symbol:', fromStatus.tokenSymbol)
  console.log('>>>> Decimals:', fromStatus.tokenDecimals)
  console.log('>>>> Name:', fromStatus.tokenName)
  console.log('>>>> Balance:', fromWei(fromStatus.tokenBalance, fromStatus.tokenDecimals))
  
  console.log('> Bridge to - fetch contract status')
  const toStatus = await fetchBridgeStatus({
    address: activeWeb3.to.bridge_address,
    multicall: activeWeb3.to.multicall,
  })
  console.log('>> Token address:', toStatus.tokenAddress)
  console.log('>>>> Symbol:', toStatus.tokenSymbol)
  console.log('>>>> Decimals:', toStatus.tokenDecimals)
  console.log('>>>> Name:', toStatus.tokenName)
  console.log('>>>> Balance:', fromWei(toStatus.tokenBalance, toStatus.tokenDecimals))
  
  if (toStatus.tokenDecimals != fromStatus.tokenDecimals) {
    console.log('[ERROR] Decimals at from and to bridge must be equal')
    return
  }
  if (new BigNumber(toStatus.tokenBalance).isLessThan(toWei(process.env.WARNING_TOKEN_BALANCE, toStatus.tokenDecimals))) {
    console.log('[WARNING] Low balance at bridge to')
  }
}

mainLoop()

