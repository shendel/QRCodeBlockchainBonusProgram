require("dotenv").config()

const { fetchBridgeStatus } = require('./helpers/fetchBridgeStatus')
const { fetchBalance } = require('./helpers/fetchBalance')
const { fetchSwapsOutQuery } = require('./helpers/fetchSwapsOutQuery')
const { processSwap } = require('./helpers/processSwap')

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

const delay = (timeout) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, timeout)
  })
}

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
  console.log('>> Fetch oracle status')
  
  const balance_from = await fetchBalance({
    address: activeWeb3.oracleAddress,
    multicall: activeWeb3.from.multicall
  })
  console.log('>>> Balance at chain from:', fromWei(balance_from))
  const balance_to = await fetchBalance({
    address: activeWeb3.oracleAddress,
    multicall: activeWeb3.to.multicall
  })
  console.log('>>> Balance at chain to:', fromWei(balance_to))

  const alreadyInCheckNeed = []
  const processSwapsLoop = () => {
    return new Promise((resolve, reject) => {
      fetchSwapsOutQuery({
        address: activeWeb3.from.bridge_address,
        multicall: activeWeb3.from.multicall
      }).then(async (answer) => {
        if (answer.swapsOutQuery && answer.swapsOutQuery.length) {
          console.log('>> Not processed swaps', answer.swapsOutQuery)
          for (let k in answer.swapsOutQuery) {
            const swapId = answer.swapsOutQuery[k]
            if (alreadyInCheckNeed.indexOf(swapId) == -1) {
              console.log('>>> Process swapId', swapId)
              try {
                const res = await processSwap({
                  ...activeWeb3,
                  swapId
                })
                console.log('>> res', res)
                
              } catch (err) {
                
                console.log('>>> Fail process swapId', swapId)
                if (err == 'ALREADY_IN') {
                  console.log('>>> Inform admin - need manual check')
                  alreadyInCheckNeed.push(swapId)
                }
              }
            }
          }
          console.log('>>>> Query ready')
          resolve(true)
        } else {
          resolve(true)
        }
      }).catch((err) => {
        console.log('errr', err)
      })
    })
  }
  
  while(true) {
    await processSwapsLoop()
    console.log('>>> delay')
    await delay(10000)
  }
  /*
  try {
    const res = await processSwap({
      ...activeWeb3,
      swapId: 4
    })
    console.log(res)
  } catch (err) {
    console.log(err)
  }
  */
}

mainLoop()

