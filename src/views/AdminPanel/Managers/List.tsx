
import { useEffect, useState, Component } from "react"
import { getAssets } from '@/helpers/getAssets'

export default function AdminPanelManagersList(props) {
  const {
    gotoPage,
  } = props
  
  return (
    <>
      <h3>AdminPanel - Managers</h3>
      <nav>
        <a href="#/admin/managers/add">[Add new manager]</a>
      </nav>
      <table>
        <thead>
          <tr>
            <td>#</td>
            <td>Address</td>
            <td>...</td>
            <td>Options</td>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td><a href="#/admin/managers/info/0x123">0x123</a></td>
            <td>...</td>
            <td>
              <a href="#/admin/managers/info/0x123">[INFO]</a>
              <a href="#/admin/managers/delete/0x123">[DELETE]</a>
            </td>
          </tr>
          <tr>
            <td>1</td>
            <td><a href="#/admin/managers/info/0x345">0x345</a></td>
            <td>...</td>
            <td>
              <a href="#/admin/managers/info/0x345">[INFO]</a>
              <a href="#/admin/managers/delete/0x345">[DELETE]</a>
            </td>
          </tr>
        </tbody>
      </table>
    </>
  )
}
