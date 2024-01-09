require("dotenv").config()

const server_port = process.env.SERVER_PORT
const server_ip = process.env.SERVER_IP

const cors = require("cors")
const express = require("express")
const app = express()

const { initWeb3 } = require("./initWeb3")
const { doClaim } = require("./doClaim")

const activeWeb3 = initWeb3()

app.use(cors())
app.use('/claim/:address/:claimer', async(req, res) => {
  const { address, claimer } = req.params
  // check addresses
  try {
    const claimTxHash = await doClaim(activeWeb3, address, claimer)
    res.json({ answer: 'ok', address, claimer, hash: claimTxHash });
  } catch (err) {
    res.json({ error: err.message })
  }
})


app.listen(server_port, server_ip, () => {
  console.log(`Backend started at http://${server_ip}:${server_port}`);
});
