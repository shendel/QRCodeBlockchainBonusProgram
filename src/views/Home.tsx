
import { useEffect, useState, Component } from "react"
import { getAssets } from '@/helpers/getAssets'

export default function Home(props) {
  const {
    gotoPage,
  } = props
  
  return (
    <>
      <a href="#/accounts">[Accounts]</a>
      <a onClick={() => { gotoPage('/account/eneeseene') }}>[Account info]</a>
      <img src={getAssets(`logo.png`)} />
    </>
  )
}
