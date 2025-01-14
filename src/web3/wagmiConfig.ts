// @ts-ignore
import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import {
  injectedWallet,
  metaMaskWallet,
  walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { createConfig } from 'wagmi';
import { WalletConnectConnector } from "@wagmi/connectors/walletConnect"
import { getChainsConfig } from './chains';
import { MAINNET_CHAIN_ID } from '@/config'

export const getWagmiConfig = (chainIds, autoConnect) => {
  const { chains, publicClient } = getChainsConfig(chainIds)
  
  const connectors = connectorsForWallets([
    {
      groupName: 'Popular',
      wallets: [
        injectedWallet({ chains }),
        metaMaskWallet({
          projectId: process.env.NEXT_PUBLIC_PROJECT_ID || "a23677c4af3139b4eccb52981f76ad94",
          chains,
          shimDisconnect: false,
        }),
      ],
    }
  ]);
  console.log('>>> connectors', connectors, MAINNET_CHAIN_ID)
  return {
    chains,
    wagmiConfig: createConfig({
      publicClient,
      connectors: [
        ...connectors(),
        new WalletConnectConnector({
          options: {
            projectId: process.env.NEXT_PUBLIC_PROJECT_ID || "a23677c4af3139b4eccb52981f76ad94",
            chains: [MAINNET_CHAIN_ID],
          }
        }),
      ],
      
      // turn off autoConnect in development
      autoConnect,
    })
  }
}
