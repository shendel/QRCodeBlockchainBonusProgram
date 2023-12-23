
import { useEffect, useState, Component } from "react"
import { getAssets } from '@/helpers/getAssets'
import fetchQRFactoryInfo from '@/qrcode_helpers/fetchQRFactoryInfo'
import { fromWei } from '@/helpers/wei'

import { WORK_CHAIN_ID, QRCODE_FACTORY } from '@/config'

export default function AdminPanel(props) {
  const {
    gotoPage,
    factoryStatus,
  } = props
  
  return (
    <>
      <div>
        <div>
          <h3>Contract status</h3>
          <div>
            <strong>Contract:</strong>
            <a href="#">{factoryStatus.address}</a>
          </div>
          <div>
            <strong>Energy:</strong>
            <span>{fromWei(factoryStatus.faucetBalance)}</span>
            <button onClick={() => { gotoPage('/admin/addenergy/factory') }}>Add</button>
          </div>
          <div>
            <strong>Tokens:</strong>
            <span>{fromWei(factoryStatus.tokenBalance, factoryStatus.tokenDecimals)}</span>
            <em>{factoryStatus.tokenSymbol}</em>
            <button onClick={() => { gotoPage('/admin/addtokens') }}>Add</button>
          </div>
        </div>
        <div>
          <h3>Backend energy</h3>
          <div>
            <strong>Claimer:</strong>
            <span>{fromWei(0)}</span>
            <button onClick={() => { gotoPage('/admin/addenergy/claimer') }}>Add</button>
          </div>
        </div>
        <div>
          <h3>QR Codes</h3>
          <div>
            <strong>Codes minted:</strong>
            <span>{factoryStatus.totalMinted}</span>
          </div>
          <div>
            <strong>Codes claimed:</strong>
            <span>{factoryStatus.totalClaimed}</span>
          </div>
          <div>
            <strong>Minted amount:</strong>
            <span>{fromWei(factoryStatus.totalMintedAmount, factoryStatus.tokenDecimals)}</span>
            <em>{factoryStatus.tokenSymbol}</em>
          </div>
          <div>
            <strong>Claimed amount:</strong>
            <span>{fromWei(factoryStatus.totalClaimedAmount, factoryStatus.tokenDecimals)}</span>
            <em>{factoryStatus.tokenSymbol}</em>
          </div>
        </div>
        <div>
          <h3>Managers</h3>
          <div>
            <strong>Count:</strong>
            <span>{factoryStatus.managersCount}</span>
            <a href="#/admin/managers/">Manage</a>
          </div>
        </div>
        <div>
          <h3>Minters</h3>
          <div>
            <strong>Count:</strong>
            <span>{factoryStatus.mintersCount}</span>
            <a href="#/admin/minters/">Manage</a>
          </div>
        </div>
        <div>
          <h3>Claimers</h3>
          <div>
            <strong>Count:</strong>
            <span>{factoryStatus.claimersCount}</span>
            <a href="#/admin/claimers/0">Manage</a>
          </div>
        </div>
      </div>
    </>
  )
}
