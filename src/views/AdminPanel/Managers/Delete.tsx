
import { useEffect, useState, Component } from "react"
import { getAssets } from '@/helpers/getAssets'

export default function AdminPanelManagersDelete(props) {
  const {
    gotoPage,
    params: {
      managerAddress
    }
  } = props
  
  return (
    <>
      <h3>AdminPanel - Managers - Info</h3>
      <nav>
        <a href="#/admin/managers/">[Back]</a>
      </nav>
      <div>
        Confirm remove manager {managerAddress}
      </div>
    </>
  )
}
