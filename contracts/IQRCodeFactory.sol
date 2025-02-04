// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

interface IQRCodeFactory {
    struct QRCODE {
        uint256 id;
        uint256 amount;
        address minter;
        address claimer;
        address claimer_call;
        uint256 minted_at;
        uint256 claimed_at;
        uint256 timelife;
        address router;
        string  message;
        
        /*
        bool isMultiUse;                    // Много-разовый
        uint256 oneClaimerDayLimit;         // Дневной лимит на человека (ноль безлимит)
        uint256 oneClaimerTotalLimit;       // Общий лимит на одного (ноль безлимит)
        uint256 oneClaimerPerScanTime;      // Время между сканами на одного человека
        */
    }

    function oracle() external view returns (address);
    function isQrCodeClaimed(address codeAddress) external view returns (bool);
    function claim(address claimer, address claimer_call) external;
    function isBannedClaimer(address who) external view returns (bool);
    function getIsManager(address check) external view returns (bool);
    function getIsMinter(address check) external view returns (bool);

    function qrCodes(uint256 id) external view returns (QRCODE memory);

    function qrCodesRoutersById(uint256 id) external view returns (address);
    function addMinterBalance(address minter, uint256 amount) external;
}