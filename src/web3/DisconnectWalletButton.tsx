import React, { useEffect, useState } from "react";
import { useDisconnect } from 'wagmi'

export default function DisconnectWalletButton(props) {

  const { disconnect } = useDisconnect()

  const {
    view: renderView,
  } = {
    view: (handleDisconnect) => {
      return (
        <button onClick={handleDisconnect}>
          Disconnect wallet
        </button>
      )
    },
    ...props
  }

  
  return (
    <>
      {renderView(() => {
        console.log('>> do disconnect')
        disconnect()
      })}
    </>
  );
}
