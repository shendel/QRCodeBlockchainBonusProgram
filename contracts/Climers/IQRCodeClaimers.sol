// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;
import "../IQRCodeFactory.sol";

interface IQRCodeClaimers {
    struct ClaimerInfo {
        address claimerAddress;
        uint256 claimedAmount;
        uint256[] claimedQrCodes;
        uint256 claimedQrCodesCount;
        uint256 faucetUsed;
        bool isBanned;
    }

    function getClaimersCount() external view returns (uint256);
    function getClaimersInfo(uint256 offset, uint256 limit) external view returns (ClaimerInfo[] memory);
    function getClaimerInfo(address claimer) external view returns (ClaimerInfo memory ret);
    function getClaimers(uint256 offset, uint256 limit) external view returns (address[] memory);
    function addFaucetUsed(address claimer, uint256 amount) external;
    function getClaimedQrCodes(address claimer, uint256 offset, uint256 limit) external view returns (IQRCodeFactory.QRCODE[] memory);
    function getClaimedQrCodesIds(address claimer, uint256 offset, uint256 limit) external view returns (uint256[] memory);
}