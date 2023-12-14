// @ts-ignore
import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import {
  injectedWallet,
  metaMaskWallet,
  walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { createConfig } from 'wagmi';

import { getChainsConfig } from './chains';

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
        /*
        walletConnectWallet({
          projectId: process.env.NEXT_PUBLIC_PROJECT_ID || "a23677c4af3139b4eccb52981f76ad94",
          chains,
        }),
        */
      ],
    }
  ]);
  
  return {
    chains,
    wagmiConfig: createConfig({
      publicClient,
      connectors,
      // turn off autoConnect in development
      autoConnect,
    })
  }
}
