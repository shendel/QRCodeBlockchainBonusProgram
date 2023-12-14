
import { useEffect, useState, Component } from "react"
import { getAssets } from '@/helpers/getAssets'
import { useAccount } from 'wagmi'

import { QRCODE_ROLES, checkRole } from '@/qrcode_helpers/checkRole'

import callQRFactoryMethod from '@/qrcode_helpers/callQRFactoryMethod'
import { QRCODE_FACTORY } from '@/config'

import { toWei } from '@/helpers/wei'

export default function QrCode(props) {
  const {
    gotoPage,
    factoryStatus,
    params: {
      qrCodeAddress
    }
  } = props
  const { address: connectedWallet } = useAccount()
  const account = useAccount()

  return (
    <>
      <h2>Minter panel</h2>
      QRCODE: { qrCodeAddress}
    </>
  )
}
