
import { useEffect, useState, Component } from "react"
import { getAssets } from '@/helpers/getAssets'

export default function Minter(props) {
  const {
    gotoPage,
  } = props
  
  return (
    <>
      <h2>Minter panel</h2>
      <nav>
        <a href="#/minter/mint">[Mint QRCode]</a>
      </nav>
    </>
  )
}
