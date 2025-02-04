// SPDX-License-Identifier: MIT
/*
    Контракт управления минтерами
*/
pragma solidity ^0.8.12;

import "../AddressSet.sol";
import "../IQRCodeFactory.sol";
import "./IQRCodeMinters.sol";
import "../QRCodeClaimer/IQRCodeClaimer.sol";

contract QRCodeMinters is IQRCodeMinters {
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
    modifier onlyFactoryCall() {
        require(address(factory) == msg.sender, "Only for factory");
        _;
    }
    modifier onlyManagerOrOracle() {
        require(tx.origin == factory.oracle() || factory.getIsManager(tx.origin) == true, "Only for oracle or manager");
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

    // Кто может генерировать коды
    AddressSet.Storage private minters;
    mapping (address => string) public mintersName;
    // Общая сумма, на которую выпущены коды каждым минтером
    mapping (address => uint256) public mintedAmount;
    // Айди кодов, которые создал минтер
    mapping (address => uint256[]) public mintedQrCodes;
    // Айжи кодов, которые обналичили
    mapping (address => uint256[]) public claimedQrCodes;
    // Айди кодов, которые не обналичили
    mapping (address => uint256[]) public notClaimedQrCodes;
    // Добавляем маппинг для хранения индексов элементов в массиве notClaimedQrCodes
    mapping(address => mapping(uint256 => uint256)) private notClaimedQrCodesIndexes;
    // Сколько всего кодов создал минтер
    mapping (address => uint256) public mintedQrCodesCount;
    // Сколько всего кодоб обналичено
    mapping (address => uint256) public claimedQrCodesCount;
    // Сколько всего кодов не обналиченно
    mapping (address => uint256) public notClaimedQrCodesCount;
    // Сумма обналиченных кодов, которые выпустил минтер
    mapping (address => uint256) public claimedByMinter;
    // Сумма не обналиченных кодов, которые выпустил минтер
    mapping (address => uint256) public notClaimedByMinter;
    // Токенов на балансе минтера
    mapping (address => uint256) minterBalance;
    // Максимальное кол-во токенов в коде для отдельного минтера
    mapping (address => uint256) maxMintAmountPerQrCode;
    
    function getIsMinter(address who) public view returns (bool) {
        return minters.exists(who);
    }

    function setIsMinter(address who, bool _isMinter) onlyManager onlyFactoryCall public {
        if (_isMinter) {
            minters.add(who);
        } else {
            minters.del(who);
        }
    }
    function setMinterName(address minter, string memory name) onlyManager onlyFactoryCall public {
        mintersName[minter] = name;
    }
    function addMinter(address minter, string memory name) onlyManager public {
        minters.add(minter);
        mintersName[minter] = name;
    }
    function setMaxMintAmountPerQrCode(address minter, uint256 newLimit) onlyManager onlyFactoryCall public {
        maxMintAmountPerQrCode[minter] = newLimit;
    }
    function setMinterBalance(address minter, uint256 newBalance) onlyManagerOrOracle onlyFactoryCall public {
        minterBalance[minter] = newBalance;
    }
    function addMinterBalance(address minter, uint256 amount) onlyManager onlyFactoryCall public {
        minterBalance[minter] = minterBalance[minter] + amount;
    }

    function getMinterName(address minter) public view returns (string memory) {
        return mintersName[minter];
    }

    function addQrCode(address minter, uint256 amount, uint256 qrCodeId) onlyFactoryCall public {
        mintedAmount[minter] += amount;
        mintedQrCodes[minter].push(qrCodeId);
        mintedQrCodesCount[minter]++;
        notClaimedByMinter[minter] += amount;
        notClaimedQrCodes[minter].push(qrCodeId);
        notClaimedQrCodesCount[minter]++;
        notClaimedQrCodesIndexes[minter][qrCodeId] = notClaimedQrCodes[minter].length;
    }

    function onClaim(address minter, uint256 codeId, uint256 amount) onlyFactoryCall public {
        claimedByMinter[minter] += amount;
        claimedQrCodesCount[minter]++;
        claimedQrCodes[minter].push(codeId);

        notClaimedByMinter[minter] -= amount;
        notClaimedQrCodesCount[minter]--;
        
        uint256 index = notClaimedQrCodesIndexes[minter][codeId];
        if (index != 0) {
            uint256 lastIndex = notClaimedQrCodes[minter].length - 1;
            if (index <= lastIndex) {
                uint256 lastCodeId = notClaimedQrCodes[minter][lastIndex];
                notClaimedQrCodes[minter][index - 1] = lastCodeId;
                notClaimedQrCodesIndexes[minter][lastCodeId] = index;
            }
            notClaimedQrCodes[minter].pop();

            delete notClaimedQrCodesIndexes[minter][codeId];
        }
    }

    function getMintersCount() public view returns (uint256) {
        return minters.length();
    }
    function getMinters() public view returns (address[] memory) {
        return minters.items(0,0);
    }

    function getMintersInfo(bool skipCodesIds) public view returns (MinterInfo[] memory) {
        MinterInfo[] memory ret = new MinterInfo[](minters.length());
        for (uint256 i = 0; i < minters.length(); i++) {
            ret[i] = getMinterInfo(minters.get(i), skipCodesIds);
        }
        return ret;
    }
    
    function getMinterInfo(address minter, bool skipCodesIds) public view returns (MinterInfo memory ret) {
        if (minters.exists(minter)) {
            return MinterInfo(
                minter,                                                     // address minterAddress;
                address(minter).balance,                                    // uint256 energy;
                mintersName[minter],                                        // string name;
                mintedAmount[minter],                                       // uint256 mintedAmount;
                claimedByMinter[minter],                                    // uint256 claimedAmount;
                notClaimedByMinter[minter],                                 // uint256 notClaimedAmount;
                (skipCodesIds) ? new uint256[](0) : mintedQrCodes[minter],  // uint256[] mintedQrCodes;
                (skipCodesIds) ? new uint256[](0) : claimedQrCodes[minter], // uint256[] claimedQRCodes;
                (skipCodesIds) ? new uint256[](0) : notClaimedQrCodes[minter], // uint256[] notClaimedQrCodes;
                mintedQrCodesCount[minter],                                 // uint256 mintedQrCodesCount;
                claimedQrCodesCount[minter],                                // uint256 claimedQrCodesCount;
                minterBalance[minter]                                       // uint256 balance;
            );
        }
    }

    function getMinterClaimedQrCodesIds(
        address minter,
        uint256 offset,
        uint256 limit
    ) public view returns (uint256[] memory) {
        uint256 size = claimedQrCodes[minter].length;
        if (limit != 0) {
            size = limit;
        }
        uint256 iEnd = offset + size;
        if (iEnd > claimedQrCodes[minter].length) {
            iEnd = claimedQrCodes[minter].length;
        }
        uint256[] memory ret = new uint256[](iEnd - offset);
        for (uint256 i = 0; i < iEnd - offset ; i++) {
            ret[i] = claimedQrCodes[minter][
                claimedQrCodes[minter].length - i - offset - 1
            ];
        }
        return ret;
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

    // Пересчет баланса
    function recalcBalance(address minter) public {
        require(minters.exists(minter), "Minter does not exist");
        uint256 newBalance = 0;
        uint256[] storage notClaimedCodes = notClaimedQrCodes[minter];

        for (uint256 i = 0; i < notClaimedCodes.length; ) {
            uint256 codeId = notClaimedCodes[i];
            IQRCodeClaimer qrCodeContract = IQRCodeClaimer(factory.qrCodesRoutersById(codeId));

            if (!qrCodeContract.isValid() && !factory.isQrCodeClaimed(address(qrCodeContract))) {
                // Если код недействителен и не обналичен, удаляем его
                uint256 lastIndex = notClaimedCodes.length - 1;

                // Заменяем текущий элемент последним элементом массива
                if (i != lastIndex) {
                    uint256 lastCodeId = notClaimedCodes[lastIndex];
                    notClaimedCodes[i] = lastCodeId;
                    notClaimedQrCodesIndexes[minter][lastCodeId] = i + 1; // Обновляем индекс замещенного элемента
                }

                // Удаляем последний элемент массива
                notClaimedCodes.pop();

                // Удаляем индекс удаленного элемента
                delete notClaimedQrCodesIndexes[minter][codeId];

                // Обновляем счетчики баланса
                newBalance += qrCodeContract.amount();
                notClaimedByMinter[minter] -= qrCodeContract.amount();
                notClaimedQrCodesCount[minter]--;
            } else {
                i++; // Переходим к следующему элементу только если текущий оставлен
            }
        }

        // Обновляем баланс минтера
        minterBalance[minter] = newBalance;
    }
}