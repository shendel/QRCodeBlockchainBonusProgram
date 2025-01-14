import React, { useEffect, useState } from "react";
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount, useDisconnect, useConnect } from 'wagmi'
import * as TgSdk from '@telegram-apps/sdk';
import { openLink, openTelegramLink  } from "@telegram-apps/sdk";

const isTelegramEnvironment = async () => {
  try {
    if (
      typeof window !== "undefined" &&
      window.Telegram &&
      window.Telegram.WebApp
    ) {
      return true;
    }

    if (
      "TelegramWebviewProxy" in window &&
      typeof window.TelegramWebviewProxy.postEvent === "function"
    ) {
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
};

export const ConnectWalletButton: React.FC = (props) => {
  const { isConnecting } = useAccount()
  const { disconnect } = useDisconnect()
  const { connectors, connect } = useConnect();
  
  const {
    connectView,
    connectedView,
    wrongChainView,
  } = {
    connectView: (isConnecting, openConnectModal) => {
      return (
        <button disabled={isConnecting} onClick={openConnectModal}>
          Connect
        </button>
      )
    },
    connectedView: (address, ensName) => {
      return (
        <button>
          {ensName ? ensName : address}
        </button>
      )
    },
    wrongChainView: (openChainModal) => {
      return (
        <button onClick={openChainModal}>
          Unsupported network
        </button>
      )
    },
    ...props
  }
  const isTgApp = (TgSdk.isMiniAppSupported())
  const handleTgAppConnect = async () => {
    const connector = connectors.find(
      (connector) => (connector.id === "walletConnect") && (connector.chains.length == 2)
    );
    if (!connector) {
      return
    }
    try {
      const answer = await connect({ connector });
    } catch (error) {
      console.error("Connection failed", error);
    }
  }
  useEffect(() => {
    const init = async () => {
      const isTG = await isTelegramEnvironment();
      if (!isTG) {
        return
      }
      if (!window.TgOpenRedefined) {
        window.TgOpenRedefined = true
        const openNative = window.open
        window.open = (url) => {
          try {
            if (!url) {
              return null;
            }
            if (typeof url !== "string") {
              url = url.toString();
            }
            if (url.startsWith("wc:")) {
              url = 'wc://' + url
            }
            openNative(url)
          } catch (error) {}
          return null
        };
      }
    }
    init();
  }, [])
  
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => (
        <div
          {...(!mounted && {
            'aria-hidden': true,
            style: {
              opacity: 0,
              pointerEvents: 'none',
              userSelect: 'none',
            },
          })}
        >
          {(() => {
            if (!mounted || !account || !chain) {
              return connectView(isConnecting, (isTgApp) ? handleTgAppConnect : openConnectModal)
            }

            if (chain.unsupported) {
              return wrongChainView(openChainModal)
            }

            return connectedView(account.address, account.ensName)
          })()}
        </div>
      )}
    </ConnectButton.Custom>
  );
};

export default ConnectWalletButton;
