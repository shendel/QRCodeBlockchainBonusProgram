
import { useEffect, useState, Component } from "react"
import { getAssets } from '@/helpers/getAssets'
import { useAccount } from 'wagmi'

import { QRCODE_ROLES, checkRole } from '@/qrcode_helpers/checkRole'

import callQRFactoryMethod from '@/qrcode_helpers/callQRFactoryMethod'
import { QRCODE_FACTORY } from '@/config'

import { toWei } from '@/helpers/wei'

export default function MinterMint(props) {
  const {
    gotoPage,
    factoryStatus,
  } = props
  const { address: connectedWallet } = useAccount()
  const account = useAccount()

  const [ amount, setAmount ] = useState(0)
  const [ message, setMessage ] = useState(``)
  const [ timelife, setTimelife ] = useState(0)

  const doMintQrCode = () => {
    callQRFactoryMethod({
      account,
      contractAddress: QRCODE_FACTORY,
      method: 'mint',
      args: [
        toWei(amount, factoryStatus.tokenDecimals),
        timelife,
        message,
      ]
    }).then((answer) => {
      console.log(answer)
      if (answer
        && answer.events
        && answer.events.QrCodeMinted
      ) {
        const qrCodeAddress = answer.events.QrCodeMinted.returnValues.qrcode
        gotoPage(`/qrcodeview/${qrCodeAddress}`)
      }
      
      /*
      {
        "QrCodeMinted": {
            "address": "0x40459B68cB59eFF70C40e21B82778bDe29149546",
            "blockNumber": 328,
            "transactionHash": "0x788876d7f97d140adc71c64e1aeb19978f2e26239ba0745c856e046be69d2d38",
            "transactionIndex": 0,
            "blockHash": "0x8602b302e05bcd938c93ab46913cfb80afac6a1e2208fc1f7d454549c3e4e8ad",
            "logIndex": 0,
            "removed": false,
            "id": "log_18a8ec23",
            "returnValues": {
                "0": "0x1C3FA597BB4eB6FBCA19AD4F943133d9b2290BB1",
                "qrcode": "0x1C3FA597BB4eB6FBCA19AD4F943133d9b2290BB1"
            },
            "event": "QrCodeMinted",
            "signature": "0x12a2dcd8d60f7d320a97f9b2f6bca5b67c1bb9808b27c28915c541eed450d05f",
            "raw": {
                "data": "0x0000000000000000000000001c3fa597bb4eb6fbca19ad4f943133d9b2290bb1",
                "topics": [
                    "0x12a2dcd8d60f7d320a97f9b2f6bca5b67c1bb9808b27c28915c541eed450d05f"
                ]
            }
        }
      }
      */
    }).catch((err) => {
      
      console.log('>>>', err)
    })
  }
  return (
    <>
      <h2>Minter panel</h2>
      <nav>
        <a href="#/minter/">[Back]</a>
      </nav>
      {checkRole(connectedWallet, factoryStatus, QRCODE_ROLES.MINTER) ? (
        <div>
          <h3>Mint new QRCode</h3>
          <div>
            <div>
              <label>Amount</label>
              <input type="number" value={amount} onChange={(e) => { setAmount(e.target.value) }} />
            </div>
          </div>
          <div>
            <div>
              <label>Message</label>
              <input type="text" value={message} onChange={(e) => { setMessage(e.target.value) }} />
            </div>
          </div>
          <div>
            <div>
              <label>Expire in</label>
              <input type="number" value={timelife} onChange={(e) => { setTimelife(e.target.value) }} />
            </div>
          </div>
          <div>
            <button onClick={doMintQrCode}>[Mint new QRCode]</button>
          </div>
        </div>
      ) : (
        <div>Access dinied</div>
      )}
    </>
  )
}
