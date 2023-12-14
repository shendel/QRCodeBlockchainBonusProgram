
import { useEffect, useState, Component } from "react"
import { getAssets } from '@/helpers/getAssets'

export default function AdminPanel(props) {
  const {
    gotoPage,
  } = props
  
  return (
    <>
      <h2>Admin panel</h2>
      <div>
        <div>
          <h3>Contract status</h3>
          <div>
            <strong>Contract:</strong>
            <a href="#">0x123</a>
          </div>
          <div>
            <strong>Energy:</strong>
            <span>123</span>
            <button>Add</button>
          </div>
          <div>
            <strong>Tokens:</strong>
            <span>123</span>
            <button>Add</button>
          </div>
        </div>
        <div>
          <h3>QR Codes</h3>
          <div>
            <strong>Codes minted:</strong>
            <span>123</span>
          </div>
          <div>
            <strong>Codes claimed:</strong>
            <span>123</span>
          </div>
          <div>
            <strong>Claimed amount:</strong>
            <span>123</span>
          </div>
        </div>
        <div>
          <h3>Managers</h3>
          <div>
            <strong>Count:</strong>
            <span>123</span>
            <a href="#/admin/managers/">Manage</a>
          </div>
        </div>
        <div>
          <h3>Minters</h3>
          <div>
            <strong>Count:</strong>
            <span>123</span>
            <a href="#">Manage</a>
          </div>
        </div>
        <div>
          <h3>Claimers</h3>
          <div>
            <strong>Count:</strong>
            <span>123</span>
            <a href="#">Manage</a>
          </div>
        </div>
      </div>
    </>
  )
}
