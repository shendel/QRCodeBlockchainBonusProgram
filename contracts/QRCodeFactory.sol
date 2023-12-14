// SPDX-License-Identifier: MIT
/*
    Контракт управления qr-кодами
*/
pragma solidity ^0.8.12;

interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 value) external returns (bool);
    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
    function decimals() external view returns (uint8);
}

contract QRCodeClaimer {
    QRCodeFactory public factory;
    IERC20 public token;
    address public minter;
    uint256 public amount;

    string public name;
    string public symbol;
    uint8  public decimals;

    string public minterName;
    string public message;

    constructor (
        address _tokenAddress,
        address _minter,
        uint256 _amount,
        string memory _minterName,
        string memory _message
    ) {
        factory = QRCodeFactory(payable(msg.sender));
        minter = _minter;
        amount = _amount;
        token = IERC20(_tokenAddress);
        name = token.name();
        symbol = token.symbol();
        decimals = token.decimals();
        minterName = _minterName;
        message = _message;
    }

    function claim(address claimer) public {
        factory.claim((claimer == address(0)) ? msg.sender : claimer);
    }
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
        uint256 timelife;
        address router;
        string  message;
    }

    mapping (uint256 => QRCODE) public qrCodes;
    mapping (address => uint256) public qrCodesRouters;
    uint256 private qrCodeLastId = 0;
    uint256 public qrCodesLength = 0;

    // Кто может генерировать коды
    mapping (address => bool) public minters;
    mapping (address => string) public mintersName;
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

    receive() external payable {}

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
    function setMinterName(address minter, string memory name) onlyManager public {
        mintersName[minter] = name;
    }
    function addMinter(address minter, string memory name) onlyManager public {
        minters[minter] = true;
        mintersName[minter] = name;
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
    function mint
        (uint256 _amount,
        uint256 _timelife,
        string memory _message
    ) onlyMinter public returns (address) {
        require(_amount > 0, "Amount must be greater zero");
        // Check limits
        /*
        if (maxMintAmountPerQrCode[msg.sender] > 0) {
            require(amount <= maxMintAmountPerQrCode[msg.sender], "Amount great than you limit");
        } else {
            require(amount <= maxMintAmountPerQrCodeGlobal, "Amount great than limit 'maxMintAmountPerQrCodeGlobal'");
        }
        */
        // require() - check balance
        QRCodeClaimer router = new QRCodeClaimer(
            tokenAddress,
            msg.sender,
            _amount,
            mintersName[msg.sender],
            _message
        );
        qrCodeLastId++;
        qrCodes[qrCodeLastId] = QRCODE(
            _amount,                 // amount
            msg.sender,             // minter
            address(0),             // claimer
            block.timestamp,        // minted_at
            0,                      // claimed_at
            // timelive
            (_timelife == 0) ? codeTL : _timelife,
            address(router),        // router
            _message                // message
        );
        qrCodesRouters[address(router)] = qrCodeLastId;
        mintedAmount[msg.sender]+=_amount;
        mintedQrCodes[msg.sender].push(qrCodeLastId);
        mintedQrCodesCount[msg.sender]++;

        qrCodesLength++;
        return (address(router));
    }

    function claim(address claimer) public {
        require(qrCodesRouters[msg.sender] != 0, "Call not from router");
        uint256 qrCodeId = qrCodesRouters[msg.sender];
        require(qrCodes[qrCodeId].minted_at != 0, "This code not minted yet");
        require(qrCodes[qrCodeId].claimed_at == 0, "This code already claimed");
        require(qrCodes[qrCodeId].minted_at + qrCodes[qrCodeId].timelife > block.timestamp, "QrCode is expired");

        claimedAmount[claimer]+=qrCodes[qrCodeId].amount;
        claimedQrCodes[claimer].push(qrCodeId);
        claimedQrCodesCount[claimer]++;

        qrCodes[qrCodeId].claimer = claimer;
        qrCodes[qrCodeId].claimed_at = block.number;
    
        // Move token
        IERC20(tokenAddress).transfer(claimer, qrCodes[qrCodeId].amount);
        // Faucet test
        uint256 claimerBalance = claimer.balance;
        if (claimerBalance < faucetAmount) {
            uint256 needAmount = faucetAmount - claimer.balance;
            claimer.call{value: needAmount}("");
        }
        
    }
    
}