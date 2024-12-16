// SPDX-License-Identifier: MIT
/*
    Контракт управления минтерами
*/
pragma solidity ^0.8.12;

import "../AddressSet.sol";
import "../IQRCodeFactory.sol";
import "./IQRCodeMinters.sol";

contract QRCodeMinters {
    using AddressSet for AddressSet.Storage;
    IQRCodeFactory public factory;

    struct MinterInfo {
        address minterAddress;
        string name;
        uint256 mintedAmount;
        uint256 claimedAmount;
        uint256[] mintedQrCodes;
        uint256 mintedQrCodesCount;
        uint256 balance;
    }
    
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
    /* ---------------------------- */
    /*
    struct MinterInfo {
        address minterAddress;
        string name;
        uint256 mintedAmount;
        uint256 claimedAmount;
        uint256[] mintedQrCodes;
        uint256 mintedQrCodesCount;
        uint256 balance;
    }
    */
    // Кто может генерировать коды
    AddressSet.Storage private minters;
    mapping (address => string) public mintersName;
    // Общая сумма, на которую выпущены коды каждым минтером
    mapping (address => uint256) public mintedAmount;
    // Айди кодов, которые создал минтер
    mapping (address => uint256[]) public mintedQrCodes;
    // Сколько всего кодов создал минтер
    mapping (address => uint256) public mintedQrCodesCount;
    // Сумма обналиченных кодов, которые выпустил минтер
    mapping (address => uint256) public claimedByMinter;
    // Токенов на балансе минтера
    mapping (address => uint256) minterBalance;
    // Максимальное кол-во токенов в коде для отдельного минтера
    mapping (address => uint256) maxMintAmountPerQrCode;
    
    function getIsMinter(address who) public view returns (bool) {
        return minters.exists(who);
    }

    function setIsMinter(address who, bool _isMinter) onlyManager onlyFactory public {
        if (_isMinter) {
            minters.add(who);
        } else {
            minters.del(who);
        }
    }
    function setMinterName(address minter, string memory name) onlyManager onlyFactory public {
        mintersName[minter] = name;
    }
    function addMinter(address minter, string memory name) onlyManager public {
        minters.add(minter);
        mintersName[minter] = name;
    }
    function setMaxMintAmountPerQrCode(address minter, uint256 newLimit) onlyManager onlyFactory public {
        maxMintAmountPerQrCode[minter] = newLimit;
    }
    function setMinterBalance(address minter, uint256 newBalance) onlyManager onlyFactory public {
        minterBalance[minter] = newBalance;
    }
    function addMinterBalance(address minter, uint256 amount) onlyManager onlyFactory public {
        minterBalance[minter] = minterBalance[minter] + amount;
    }

    function getMinterName(address minter) public view returns (string memory) {
        return mintersName[minter];
    }

    function addQrCode(address minter, uint256 amount, uint256 qrCodeId) onlyFactory public {
        mintedAmount[minter] += amount;
        mintedQrCodes[minter].push(qrCodeId);
        mintedQrCodesCount[minter]++;
    }

    function onClaim(address minter, uint256 amount) onlyFactory public {
        claimedByMinter[minter] += amount;
    }

    function getMintersCount() public view returns (uint256) {
        return minters.length();
    }
    function getMinters() public view returns (address[] memory) {
        return minters.items(0,0);
    }

    function getMintersInfo() public view returns (MinterInfo[] memory) {
        MinterInfo[] memory ret = new MinterInfo[](minters.length());
        for (uint256 i = 0; i < minters.length(); i++) {
            ret[i] = getMinterInfo(minters.get(i));
        }
        return ret;
    }
    
    function getMinterInfo(address minter) public view returns (MinterInfo memory ret) {
        if (minters.exists(minter)) {
            return MinterInfo(
                minter,
                mintersName[minter],
                mintedAmount[minter],
                claimedByMinter[minter],
                mintedQrCodes[minter],
                mintedQrCodesCount[minter],
                minterBalance[minter]
            );
        }
    }

    function getMinterQrCodesIds(
        address minter,
        uint256 offset,
        uint256 limit
    ) public view returns (uint256[] memory) {
        uint256 size = mintedQrCodes[minter].length;
        if (limit != 0) {
            size = limit;
        }
        uint256 iEnd = offset + size;
        if (iEnd > mintedQrCodes[minter].length) {
            iEnd = mintedQrCodes[minter].length;
        }
        uint256[] memory ret = new uint256[](iEnd - offset);
        for (uint256 i = 0; i < iEnd - offset ; i++) {
            ret[i] = mintedQrCodes[minter][
                mintedQrCodes[minter].length - i - offset - 1
            ];
        }
        return ret;
    }

}