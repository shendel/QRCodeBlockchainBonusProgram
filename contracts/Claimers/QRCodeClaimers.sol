// SPDX-License-Identifier: MIT

pragma solidity ^0.8.12;

import "../AddressSet.sol";
import "../IQRCodeFactory.sol";
import "./IQRCodeClaimers.sol";

contract QRCodeClaimers is IQRCodeClaimers {
    using AddressSet for AddressSet.Storage;
    IQRCodeFactory public factory;

    address owner;
    modifier onlyOwner() {
        require(msg.sender == owner, "Only for owner");
        _;
    }
    modifier onlyManager() {
        require(factory.getIsManager(tx.origin) == true, "Only for managers");
        _;
    }
    modifier onlyFactory() {
        require(address(factory) == msg.sender, "Only for factory");
        _;
    }
    constructor() {
        owner = msg.sender;
    }

    function setOwner(address newOwner) onlyOwner public {
        require(address(0) == newOwner, "Owner cant be zero");
        owner = newOwner;
    }

    function setFactory(address newFactory) onlyOwner public {
        factory = IQRCodeFactory(newFactory);
    }

    // Сколько токенов обналичил адрес
    AddressSet.Storage private claimers;
    mapping (address => uint256) public claimedAmount;
    // Айди кодов, который обналичил адрес
    mapping (address => uint256[]) public claimedQrCodes;
    // Сколько всего кодов обналичил адрес
    mapping (address => uint256) public claimedQrCodesCount;
    // Сколько энергии получил клаймер 
    mapping (address => uint256) public claimedFaucetUsed;

    function getClaimersCount() public view returns (uint256) {
        return claimers.length();
    }
    function getClaimersInfo(
        uint256 offset,
        uint256 limit
    ) public view returns (ClaimerInfo[] memory) {
        address[] memory items = claimers.items(offset, limit);
        ClaimerInfo[] memory ret = new ClaimerInfo[](items.length);
        for (uint256 i = 0; i < items.length; i++) {
            ret[i] = getClaimerInfo(items[i]);
        }
        return ret;
    }
    function getClaimerInfo(address claimer) public view returns (ClaimerInfo memory ret) {
        if (claimers.exists(claimer)) {
            return ClaimerInfo (
                claimer,
                claimedAmount[claimer],
                claimedQrCodes[claimer],
                claimedQrCodesCount[claimer],
                claimedFaucetUsed[claimer],
                factory.isBannedClaimer(claimer)
            );
        }
    }
    function getClaimers(uint256 offset, uint256 limit) public view returns (address[] memory) {
        return claimers.items(offset, limit);
    }
    function addFaucetUsed(address claimer, uint256 amount) public onlyFactory {
        claimedFaucetUsed[claimer]+=amount;
    }
    function onClaim(address claimer, uint256 amount, uint256 qrCodeId) public onlyFactory {
        claimedAmount[claimer]+=amount;
        claimedQrCodes[claimer].push(qrCodeId);
        claimedQrCodesCount[claimer]++;
        claimers.add(claimer);
    }
    function getClaimedQrCodes(address claimer, uint256 offset, uint256 limit) public view returns (IQRCodeFactory.QRCODE[] memory) {
        uint256[] memory ids = getClaimedQrCodesIds(claimer, offset, limit);
        IQRCodeFactory.QRCODE[] memory ret = new IQRCodeFactory.QRCODE[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            ret[i] = factory.qrCodes(i);
        }
        return ret;
    }
    function getClaimedQrCodesIds(
        address claimer,
        uint256 offset,
        uint256 limit
    ) public view returns (uint256[] memory) {
        uint256 size = claimedQrCodes[claimer].length;
        if (limit != 0) {
            size = limit;
        }
        uint256 iEnd = offset + size;
        if (iEnd > claimedQrCodes[claimer].length) {
            iEnd = claimedQrCodes[claimer].length;
        }
        uint256[] memory ret = new uint256[](iEnd - offset);
        for (uint256 i = 0; i < iEnd - offset ; i++) {
            ret[i] = claimedQrCodes[claimer][
                claimedQrCodes[claimer].length - i - offset - 1
            ];
        }
        return ret;
    }
}