
import { useEffect, useState, Component } from "react"
import { getAssets } from '@/helpers/getAssets'

export default function AdminPanelManagersAdd(props) {
  const {
    gotoPage,
  } = props
  
  return (
    <>
      <h3>AdminPanel - Managers - Add</h3>
      <nav>
        <a href="#/admin/managers/">[Back]</a>
      </nav>
      <div>
        add manager form
      </div>
    </>
  )
}
