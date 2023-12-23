import QRFactoryContractData from "@/abi/QRCodeFactory.json"
import getMultiCall from '@/web3/getMultiCall'
import { Interface as AbiInterface } from '@ethersproject/abi'
import { callMulticall } from '@/helpers/callMulticall'

const fetchQRFactoryInfo = (options) => {
  const {
    address,
    chainId,
  } = {
    ...options
  }
  return new Promise((resolve, reject) => {
    const multicall = getMultiCall(chainId)
    const abiI = new AbiInterface(QRFactoryContractData.abi)
    callMulticall({
      multicall,
      target: address,
      encoder: abiI,
      calls: {
        owner: { func: 'owner' },
        tokenAddress: { func: 'tokenAddress' },
        tokenName: { func: 'getTokenName' },
        tokenSymbol: { func: 'getTokenSymbol' },
        tokenDecimals: { func: 'getTokenDecimals' },
        tokenBalance: { func: 'getTokenBalance' },
        faucetBalance: { func: 'getFaucetBalance' },
        mintersCount: { func: 'getMintersCount' },
        managersCount: { func: 'getManagersCount' },
        claimersCount: { func: 'getClaimersCount' },
        bannedClaimersCount: { func: 'getBannedClaimersCount' },
        totalMinted: { func: 'qrCodesLength' },
        totalClaimed: { func: 'totalQrCodesClaimed' },
        totalClaimedAmount: { func: 'totalClaimedAmount' },
        totalMintedAmount: { func: 'totalMintedAmount' },
        totalFaucetAmount: { func: 'totalFaucetAmount' },
        defaultExpireTime: { func: 'codeTL' },
        claimMinEnergy: { func: 'faucetAmount' },
      }
    }).then((answer) => {
      console.log('>> answer', answer)
      resolve({
        chainId,
        address,
        ...answer
      })
    }).catch((err) => {
      console.log('>> call mc err', err)
      reject(err)
    })
  })
}

export default fetchQRFactoryInfo