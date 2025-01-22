// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

interface IQRCodeMinters {
    function setOwner(address newOwner) external;
    function setFactory(address newFactory) external;
    /* ---------------------------- */
    struct MinterInfo {
        address minterAddress;
        uint256 energy;
        string name;
        uint256 mintedAmount;
        uint256 claimedAmount;
        uint256 notClaimedAmount;
        uint256[] mintedQrCodes;
        uint256[] claimedQRCodes;
        uint256[] notClaimedQrCodes;
        uint256 mintedQrCodesCount;
        uint256 claimedQrCodesCount;
        uint256 balance;
    }
    
    function getIsMinter(address who) external view returns (bool);
    function setIsMinter(address who, bool isMinter) external;
    function setMinterName(address minter, string memory name) external;
    function addMinter(address minter, string memory name) external;
    function setMaxMintAmountPerQrCode(address minter, uint256 newLimit) external;
    function setMinterBalance(address minter, uint256 newBalance) external;
    function addMinterBalance(address minter, uint256 amount) external;
    
    function getMinterName(address minter) external view returns (string memory);
    function getMintersCount() external view returns (uint256);
    function getMinters() external view returns (address[] memory);
    function getMintersInfo(bool skipCodesIds) external view returns (MinterInfo[] memory);
    function getMinterInfo(address minter, bool skipCodesIds) external view returns (MinterInfo memory ret);
    function getMinterQrCodesIds(address minter, uint256 offset, uint256 limit) external view returns (uint256[] memory);
    function getMinterClaimedQrCodesIds(address minter, uint256 offset, uint256 limit) external view returns (uint256[] memory);
    
    function addQrCode(address minter, uint256 amount, uint256 qrCodeId) external;

    function onClaim(address minter, uint256 codeId, uint256 amount) external;
}