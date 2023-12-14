// @ts-nocheck
import { configureChains } from 'wagmi';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc'

const NETWORKS = {
  energy: {
    chainId: 800500,
    name: 'EnergyChain',
    nativeCurrency: {
      name: "Energy",
      symbol: "ENERGY",
      decimals: 18,
    },
    rpc: 'http://rpc.proxima:8545/',
    explorer: 'http://explorer.proxima/',
    multicall: '0xdA1FB74466030C13064cF263A26a25b158bE2aB3',
  },
  goerli: {
    chainId: 5,
    name: "Goerli",
    nativeCurrency: {
      name: "Goerli Ether",
      symbol: "ETH",
      decimals: 18
    },
    rpc: "https://eth-goerli.g.alchemy.com/v2/wNvkA78LYEG7fb5S5z4nJIfB22dAcvuH",
    explorer: "https://goerli.etherscan.io",
    multicall: '0xf0cc52809a6c63dab849e368b0620db17cb41cf8',
  },
  mainnet: {
    chainId: 1,
    name: "Ethereum",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18
    },
    rpc: "https://mainnet.infura.io/v3/7213b5d53a4943b7af08a9cfce1cf2e2",
    explorer: "https://etherscan.io",
    multicall: '0x5BA1e12693Dc8F9c48aAD8770482f4739bEeD696',
  },
  bsc: {
    chainId: 56,
    name: "BSC",
    nativeCurrency: {
      name: "BNB",
      symbol: "BNB",
      decimals: 18
    },
    rpc: "https://bscrpc.com/",
    explorer: "https://bscscan.com",
    multicall: '0xa9193376D09C7f31283C54e56D013fCF370Cd9D9',
  },
  bsc_test: {
    chainId: 97,
    name: "BSC testnet",
    nativeCurrency: {
      name: "BNB",
      symbol: "BNB",
      decimals: 18
    },
    rpc: "https://data-seed-prebsc-1-s2.binance.org:8545",
    explorer: "https://testnet.bscscan.com",
    multicall: '0xe348b292e8eA5FAB54340656f3D374b259D658b8',
  },
  matic: {
    chainId: 137,
    name: "Polygon",
    nativeCurrency: {
      name: "MATIC",
      symbol: "MATIC",
      decimals: 18
    },
    rpc: "https://polygon-rpc.com/",
    explorer: "https://polygonscan.com/",
    multicall: '0x02817C1e3543c2d908a590F5dB6bc97f933dB4BD',
  },
  mumbai: {
    chainId: 80001,
    name: "Polygon testnet",
    nativeCurrency: {
      name: "MATIC",
      symbol: "MATIC",
      decimals: 18
    },
    rpc: "https://endpoints.omniatech.io/v1/matic/mumbai/public",
    explorer: "https://mumbai.polygonscan.com/",
    multicall: '0x6aa1bdc159e28beca44cc7f1a260a25e7b63f53d',
  },
  fantom: {
    chainId: 250,
    name: "Fantom Opera",
    nativeCurrency: {
      name: "FTM",
      symbol: "FTM",
      decimals: 18
    },
    rpc: "https://rpc.ftm.tools/",
    explorer: "https://ftmscan.com",
    multicall: '0x22D4cF72C45F8198CfbF4B568dBdB5A85e8DC0B5'
  },
  arbeth_mainnet: {
    chainId: 42161,
    name: "Arbitrum",
    nativeCurrency: {
      name: "ETH",
      symbol: "ETH",
      decimals: 18
    },
    rpc: "https://arb1.arbitrum.io/rpc",
    explorer: "https://arbiscan.io/",
    multicall: '0x80C7DD17B01855a6D2347444a0FCC36136a314de',
  },
  xdai: {
    chainId: 100,
    name: "Gnosis Mainnet (xDai)",
    nativeCurrency: {
      name: "XDAI",
      symbol: "XDAI",
      decimals: 18
    },
    rpc: "https://rpc.gnosischain.com",
    explorer: "https://blockscout.com/xdai/mainnet",
    multicall: '0x67dA5f2FfaDDfF067AB9d5F025F8810634d84287',
  }
}

const GET_ALL_CHAINS = () => {
  return Object.keys(NETWORKS).map((chainName) => {
    return {
      id: NETWORKS[chainName].chainId,
      network: chainName,
      name: NETWORKS[chainName].name,
      nativeCurrency: NETWORKS[chainName].nativeCurrency,
      rpcUrls: {
        default: {
          http: [
            NETWORKS[chainName].rpc
          ]
        },
        public: {
          http: [
            NETWORKS[chainName].rpc
          ]
        }
      },
    }
  })
}

const GET_CHAIN_BYID = (chainId) => {
  const info = Object
    .keys(NETWORKS)
    .filter((chainName) => {
      return NETWORKS[chainName].chainId == chainId
    })
    .map((chainName) => {
      return {
        id: NETWORKS[chainName].chainId,
        network: chainName,
        name: NETWORKS[chainName].name,
        nativeCurrency: NETWORKS[chainName].nativeCurrency,
        rpcUrls: {
          default: {
            http: [
              NETWORKS[chainName].rpc
            ]
          },
          public: {
            http: [
              NETWORKS[chainName].rpc
            ]
          }
        },
      }
    })
  return info[0] || false
}

const GET_CHAIN = (chainName) => {
  return {
    id: NETWORKS[chainName].chainId,
    network: chainName,
    name: NETWORKS[chainName].name,
    nativeCurrency: NETWORKS[chainName].nativeCurrency,
    rpcUrls: {
      default: {
        http: [
          NETWORKS[chainName].rpc
        ]
      },
      public: {
        http: [
          NETWORKS[chainName].rpc
        ]
      }
    },
  }
}

export const GET_TX_LINK = (chainId, hash) => {
  return NETWORKS[chainId].explorer + '/tx/' + hash
}

export const GET_CHAIN_RPC = (chainId) => {
  const chainData = Object.keys(NETWORKS).filter((chainName) => {
    return `${NETWORKS[chainName].chainId}` == `${chainId}`
  })
  if (chainData.length) return NETWORKS[chainData[0]].rpc
}

export const getChainsConfig = (chainIds) => {
  const networks = (chainIds == undefined)
    ? GET_ALL_CHAINS()
    : (chainIds instanceof Array)
      ? chainIds.map((chainId) => { return GET_CHAIN_BYID(chainId) })
      : [GET_CHAIN_BYID(chainIds)]

  return configureChains(
    networks,
    [
      jsonRpcProvider({
        rpc: (chain) => ({
          http: GET_CHAIN_RPC(chain.id),
        }),
      }),
    ],
  )
}
