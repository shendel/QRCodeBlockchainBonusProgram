// SPDX-License-Identifier: MIT
/*
    Контракт управления qr-кодами
*/
pragma solidity ^0.8.12;

interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 value) external returns (bool);
}

contract QRCodeFactory {
    address public owner;

    address public tokenAddress;                 // Адресс токена

    uint256 public codeTL = 30 minutes;         // Время жизни кода
    // Сколько должно быть минимум нативной валюты у человека, который отсканировал код
    // Если меньше указанной суммы, вместе с токеном еще и пополняем баланс, чтобы было минимум указаное кол-во
    // В UI это поле будет называться "Энергия" или как-то так
    // Так-же в UI будет возможность запросить энергию с крана (для бриджа в другую сеть)
    uint256 public faucetAmount = 0.01 ether;   

    struct QRCODE {
        uint256 amount;
        address minter;
        address claimer;
        uint256 minted_at;
        uint256 claimed_at;
    }

    mapping (uint256 => QRCODE) public qrCodes;
    uint256 private qrCodeLastId = 0;
    uint256 public qrCodesLength = 0;

    // Кто может генерировать коды
    mapping (address => bool) public minters;
    // Общая сумма, на которую выпущены коды каждым минтером
    mapping (address => uint256) public mintedAmount;
    // Айди кодов, которые создал минтер
    mapping (address => uint256[]) public mintedQrCodes;
    // Сколько всего кодов создал минтер
    mapping (address => uint256) public mintedQrCodesCount;

    // Сколько токенов обналичил адрес
    mapping (address => uint256) public claimedAmount;
    // Айди кодов, который обналичил адрес
    mapping (address => uint256[]) public claimedQrCodes;
    // Сколько всего кодов обналичил адрес
    mapping (address => uint256) public claimedQrCodesCount;

    // Максимальное кол-во токенов в коде
    uint256 public maxMintAmountPerQrCodeGlobal = 0.0001 ether;
    // Максимальное кол-во токенов в коде для отдельного минтера
    mapping (address => uint256) maxMintAmountPerQrCode;
    // Токенов на балансе минтера
    mapping (address => uint256) minterBalance;
    
    mapping (address => bool) public managers;
        modifier onlyOwner() {
        require(msg.sender == owner, "Only for owner");
        _;
    }
    modifier onlyManager() {
        require(managers[msg.sender] == true, "Only for managers");
        _;
    }
    modifier onlyMinter() {
        require(minters[msg.sender] = true, "Only for minters");
        _;
    }

    constructor(address _tokenAddress) {
        owner = msg.sender;
        managers[msg.sender] = true;
        minters[msg.sender] = true;
        tokenAddress = _tokenAddress;
    }
    /* Setters */
    function transferOwnership(address newOwner) onlyOwner public {
        require(newOwner != address(0), "Owner address cant be zero");
        owner = newOwner;
    }
    function setCodeTL(uint256 _codeTL) onlyOwner public {
        codeTL = _codeTL;
    }
    function setFaucetAmount(uint256 _faucetAmount) onlyOwner public {
        faucetAmount = _faucetAmount;
    }
    function setIsManager(address who, bool isManager) onlyOwner public {
        managers[who] = isManager;
    }
    function setIsMinter(address who, bool isMinter) onlyManager public {
        minters[who] = isMinter;
    }
    function setMaxMintAmountPerQrCodeGlobal(uint256 newLimit) onlyManager public {
        maxMintAmountPerQrCodeGlobal = newLimit;
    }
    function setMaxMintAmountPerQrCode(address minter, uint256 newLimit) onlyManager public {
        maxMintAmountPerQrCode[minter] = newLimit;
    }
    function setMinterBalance(address minter, uint256 newBalance) onlyManager public {
        minterBalance[minter] = newBalance;
    }
    function addMinterBalance(address minter, uint256 amount) onlyManager public {
        minterBalance[minter] = minterBalance[minter] + amount;
    }
    /* Getters */
    function getQrCode(uint256 index) public view returns (QRCODE memory) {
        return qrCodes[index];
    }
    function getIsManager(address check) public view returns (bool) {
        return managers[check];
    }
    function getIsMinter(address check) public view returns (bool) {
        return minters[check];
    }
    function getMintedAmount(address minter) public view returns (uint256) {
        return mintedAmount[minter];
    }
    function getMintedQrCodes(address minter) public view returns (uint256[] memory) {
        return mintedQrCodes[minter];
    }
    function getMintedQrCodesCount(address minter) public view returns (uint256) {
        return mintedQrCodesCount[minter];
    }

    function getClaimedAmount(address claimer) public view returns (uint256) {
        return claimedAmount[claimer];
    }
    function getClaimedQrCodes(address claimer) public view returns (uint256[] memory) {
        return claimedQrCodes[claimer];
    }
    function getClaimedQrCodesCount(address claimer) public view returns (uint256) {
        return claimedQrCodesCount[claimer];
    }
    function getTokenBalance() public view returns (uint256) {
        return IERC20(tokenAddress).balanceOf(address(this));
    }
    function getFaucetBalance() public view returns (uint256) {
        return address(this).balance;
    }
    function getAddressTokenBalance(address _address) public view returns (uint256) {
        return IERC20(tokenAddress).balanceOf(_address);
    }
    function getAddressNativeBalance(address _address) public view returns (uint256) {
        return _address.balance;
    }
    /* ---- */
    function mint(uint256 amount) onlyMinter public returns (uint256) {
        require(amount > 0, "Amount must be greater zero");
        // Check limits
        /*
        if (maxMintAmountPerQrCode[msg.sender] > 0) {
            require(amount <= maxMintAmountPerQrCode[msg.sender], "Amount great than you limit");
        } else {
            require(amount <= maxMintAmountPerQrCodeGlobal, "Amount great than limit 'maxMintAmountPerQrCodeGlobal'");
        }
        */
        // require() - check balance
        qrCodeLastId++;
        qrCodes[qrCodeLastId] = QRCODE(
            amount,
            msg.sender,
            address(0),
            block.timestamp,
            0
        );
        mintedAmount[msg.sender]+=amount;
        mintedQrCodes[msg.sender].push(qrCodeLastId);
        mintedQrCodesCount[msg.sender]++;

        qrCodesLength++;
        return (qrCodeLastId);
    }

    function claim(uint256 qrCodeId, address claimer) public {
        require(qrCodes[qrCodeId].minted_at != 0, "This code not minted yet");
        require(qrCodes[qrCodeId].claimed_at == 0, "This code already claimed");
        require(qrCodes[qrCodeId].minted_at + codeTL > block.timestamp, "QrCode is expired");

        claimedAmount[claimer]+=qrCodes[qrCodeId].amount;
        claimedQrCodes[claimer].push(qrCodeId);
        claimedQrCodesCount[claimer]++;

        qrCodes[qrCodeId].claimer = claimer;
        qrCodes[qrCodeId].claimed_at = block.number;
    
        // Faucet test
        // Move token
    }
    
}