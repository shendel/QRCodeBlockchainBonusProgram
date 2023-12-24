
import { useEffect, useState, Component } from "react"
import { getAssets } from '@/helpers/getAssets'
import fetchQRFactoryInfo from '@/qrcode_helpers/fetchQRFactoryInfo'
import { fromWei } from '@/helpers/wei'
import { shortAddress } from '@/helpers/shortAddress'
import { WORK_CHAIN_ID, QRCODE_FACTORY } from '@/config'

export default function AdminPanel(props) {
  const {
    gotoPage,
    factoryStatus,
  } = props
  
  return (
    <>
      <style>
      {`
        .adminDashStatus {
          display: flex;
          justify-content: center;
          align-items: stretch;
          flex-wrap: wrap;
          flex-direction: row;
        }
        .adminDashStatus .cart {
          margin: 0.5em;
          background: #fff;
          border-radius: 5px;
          box-shadow: 1px 1px 5px 0px #1d4a725e;
        }
        .adminDashStatus .cart DIV {
          padding: 0.5em;
          color: #111827;
          font-size: 11pt;
        }
        .adminDashStatus .cart H3 {
          background: #ccdfeb;
          margin: 0;
          padding: 0.5em;
          font-size: 14pt;
          color: #11273b;
          border-top-left-radius: 0px;
          border-top-right-radius: 0px;
        }
      `}
      </style>
      <div className="adminDashStatus">
        <div className="cart">
          <h3>Contract status</h3>
          <div>
            <strong>Contract:</strong>
            <a href="#">{shortAddress(factoryStatus.address)}</a>
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
        <div className="cart">
          <h3>Backend energy</h3>
          <div>
            <strong>Claimer:</strong>
            <span>{fromWei(0)}</span>
            <button onClick={() => { gotoPage('/admin/addenergy/claimer') }}>Add</button>
          </div>
        </div>
        <div className="cart">
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
        <div className="cart">
          <h3>Managers</h3>
          <div>
            <strong>Count:</strong>
            <span>{factoryStatus.managersCount}</span>
            <a href="#/admin/managers/">Manage</a>
          </div>
        </div>
        <div className="cart">
          <h3>Minters</h3>
          <div>
            <strong>Count:</strong>
            <span>{factoryStatus.mintersCount}</span>
            <a href="#/admin/minters/">Manage</a>
          </div>
        </div>
        <div className="cart">
          <h3>Claimers</h3>
          <div>
            <strong>Count:</strong>
            <span>{factoryStatus.claimersCount}</span>
            <a href="#/admin/claimers/0">Manage</a>
          </div>
          <div>
            <strong>Banned:</strong>
            <span>{factoryStatus.claimersBannedCount}</span>
            <a href="#/admin/claimers/banned/0">Manage</a>
          </div>
        </div>
      </div>
    </>
  )
}
