// SPDX-License-Identifier: MIT
/*
    Контракт управления qr-кодами
*/
pragma solidity ^0.8.12;

library AddressSet {
    struct Storage {
        mapping (address => bool) _exists;
        address[] _items;
    }
    function add(Storage storage arr, address item) public  {
        if (!arr._exists[item]) {
            arr._items.push(item);
            arr._exists[item] = true;
        }
    }
    function exists(Storage storage arr, address item) public view returns (bool) {
        return arr._exists[item];
    }
    function length(Storage storage arr) public view returns (uint256) {
        return arr._items.length;
    }
    function items(Storage storage arr) public view returns (address[] memory) {
        return arr._items;
    }
    function get(Storage storage arr, uint256 index) public view returns (address ret) {
        if (index < arr._items.length) {
            return arr._items[index];
        }
    }
    function del(Storage storage arr, address item) public  {
        if (arr._exists[item]) {
            arr._exists[item] = false;
            if (arr._items.length == 1 || (arr._items[arr._items.length-1] == item)) {
                arr._items.pop();
                return;
            }
            if (arr._items[0] == item) {
                arr._items[0] = arr._items[arr._items.length -1];
                return;
            }
            for(uint256 i = 0; i < arr._items.length; i++) {
                if (arr._items[i] == item) {
                    arr._items[i] = arr._items[arr._items.length -1];
                    arr._items.pop();
                    return;
                }
            }
        }
    }
}

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

    uint256 public created_at;
    uint256 public timelife;

    
    constructor (
        address _tokenAddress,
        address _minter,
        uint256 _amount,
        uint256 _created_at,
        uint256 _timelife,
        string memory _minterName,
        string memory _message
    ) {
        factory = QRCodeFactory(payable(msg.sender));
        minter = _minter;
        amount = _amount;
        created_at = _created_at;
        timelife = _timelife;
        token = IERC20(_tokenAddress);
        name = token.name();
        symbol = token.symbol();
        decimals = token.decimals();

        minterName = _minterName;
        message = _message;
    }

    function isValid() public view returns (bool) {
        return ((created_at + timelife) > block.timestamp) ? true : false;
    }

    function isClaimed() public view returns (bool) {
        return factory.isQrCodeClaimed(address(this));
    }

    function claim(address claimer) public {
        factory.claim((claimer == address(0)) ? msg.sender : claimer);
    }
}
contract QRCodeFactory {
    event QrCodeMinted(address qrcode);

    using AddressSet for AddressSet.Storage;
    address public owner;

    address public tokenAddress;                 // Адресс токена

    uint256 public codeTL = 30 minutes;         // Время жизни кода
    // Сколько должно быть минимум нативной валюты у человека, который отсканировал код
    // Если меньше указанной суммы, вместе с токеном еще и пополняем баланс, чтобы было минимум указаное кол-во
    // В UI это поле будет называться "Энергия" или как-то так
    // Так-же в UI будет возможность запросить энергию с крана (для бриджа в другую сеть)
    uint256 public faucetAmount = 0.01 ether;   

    struct QRCODE {
        uint256 id;
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

    uint256 public totalQrCodesClaimed = 0;
    uint256 public totalMintedAmount = 0;
    uint256 public totalClaimedAmount = 0;
    uint256 public totalFaucetAmount = 0;

    struct MinterInfo {
        address minterAddress;
        string name;
        uint256 mintedAmount;
        uint256 claimedAmount;
        uint256[] mintedQrCodes;
        uint256 mintedQrCodesCount;
        uint256 balance;
    }
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

    struct ClaimerInfo {
        address claimerAddress;
        uint256 claimedAmount;
        uint256[] claimedQrCodes;
        uint256 claimedQrCodesCount;
    }
    // Сколько токенов обналичил адрес
    AddressSet.Storage private claimers;
    mapping (address => uint256) public claimedAmount;
    // Айди кодов, который обналичил адрес
    mapping (address => uint256[]) public claimedQrCodes;
    // Сколько всего кодов обналичил адрес
    mapping (address => uint256) public claimedQrCodesCount;

    // Максимальное кол-во токенов в коде
    uint256 public maxMintAmountPerQrCodeGlobal = 0.0001 ether;
    // Максимальное кол-во токенов в коде для отдельного минтера
    mapping (address => uint256) maxMintAmountPerQrCode;
    
    
    AddressSet.Storage private managers;


    modifier onlyOwner() {
        require(msg.sender == owner, "Only for owner");
        _;
    }
    modifier onlyManager() {
        require(managers.exists(msg.sender) == true, "Only for managers");
        _;
    }
    modifier onlyMinter() {
        require(minters.exists(msg.sender) == true, "Only for minters");
        _;
    }

    receive() external payable {}

    constructor(address _tokenAddress) {
        owner = msg.sender;
        managers.add(msg.sender);
        minters.add(msg.sender);
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
        if (isManager) {
            managers.add(who);
        } else {
            managers.del(who);
        }
    }
    function setIsMinter(address who, bool isMinter) onlyManager public {
        if (isMinter) {
            minters.add(who);
        } else {
            minters.del(who);
        }
    }
    function setMinterName(address minter, string memory name) onlyManager public {
        mintersName[minter] = name;
    }
    function addMinter(address minter, string memory name) onlyManager public {
        minters.add(minter);
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

    function getTokenName() public view returns (string memory) {
        return IERC20(tokenAddress).name();
    }
    function getTokenSymbol() public view returns (string memory) {
        return IERC20(tokenAddress).symbol();
    }
    function getTokenDecimals() public view returns (uint256) {
        return IERC20(tokenAddress).decimals();
    }
    function getAllQrCodes() public view returns (QRCODE[] memory) {
        QRCODE[] memory retCodes = new QRCODE[](qrCodesLength);
        for (uint256 curId = 1; curId <= qrCodeLastId; curId++) {
            retCodes[curId-1] = qrCodes[curId];
        }
        return retCodes;
    }
    function getQrCode(uint256 index) public view returns (QRCODE memory) {
        return qrCodes[index];
    }
    function getQrCodeByAddress(address router) public view returns (QRCODE memory ret) {
        if (qrCodesRouters[router] != 0) {
            return qrCodes[qrCodesRouters[router]];
        }
    }
    function getIsManager(address check) public view returns (bool) {
        return managers.exists(check);
    }
    function getManagers() public view returns (address[] memory) {
        return managers.items();
    }
    function getIsMinter(address check) public view returns (bool) {
        return minters.exists(check);
    }
    function getMinters() public view returns (address[] memory) {
        return minters.items();
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
    function getMintedAmount(address minter) public view returns (uint256) {
        return mintedAmount[minter];
    }
    function getMintedQrCodesIds(address minter) public view returns (uint256[] memory) {
        return mintedQrCodes[minter];
    }
    function getMinterQrCodes(address minter) public view returns (QRCODE[] memory) {
        QRCODE[] memory ret = new QRCODE[](mintedQrCodes[minter].length);
        for (uint256 i = 0; i < mintedQrCodes[minter].length; i++) {
            ret[i] = qrCodes[mintedQrCodes[minter][i]];
        }
        return ret;
    }
    function getMintedQrCodesCount(address minter) public view returns (uint256) {
        return mintedQrCodesCount[minter];
    }
    function getClaimersInfo() public view returns (ClaimerInfo[] memory) {
        ClaimerInfo[] memory ret = new ClaimerInfo[](claimers.length());
        for (uint256 i = 0; i < claimers.length(); i++) {
            ret[i] = getClaimerInfo(claimers.get(i));
        }
        return ret;
    }
    function getClaimerInfo(address claimer) public view returns (ClaimerInfo memory ret) {
        if (claimers.exists(claimer)) {
            return ClaimerInfo (
                claimer,
                claimedAmount[claimer],
                claimedQrCodes[claimer],
                claimedQrCodesCount[claimer]
            );
        }
    }
    function getClaimers() public view returns (address[] memory) {
        return claimers.items();
    }
    function getClaimedAmount(address claimer) public view returns (uint256) {
        return claimedAmount[claimer];
    }
    function getClaimedQrCodesIds(address claimer) public view returns (uint256[] memory) {
        return claimedQrCodes[claimer];
    }
    function getClaimedQrCodes(address claimer) public view returns (QRCODE[] memory) {
        QRCODE[] memory ret = new QRCODE[](claimedQrCodes[claimer].length);
        for (uint256 i = 0; i < claimedQrCodes[claimer].length; i++) {
            ret[i] = qrCodes[claimedQrCodes[claimer][i]];
        }
        return ret;
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
    function isQrCodeClaimed(address router) public view returns (bool) {
        if (qrCodesRouters[router] != 0) {
            return (qrCodes[qrCodesRouters[router]].claimed_at == 0) ? false : true;
        }
        return false;
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
        uint256 qrTL = (_timelife == 0) ? codeTL : _timelife;
        QRCodeClaimer router = new QRCodeClaimer(
            tokenAddress,
            msg.sender,
            _amount,
            block.timestamp,
            qrTL,
            mintersName[msg.sender],
            _message
        );

        qrCodeLastId++;
        qrCodes[qrCodeLastId] = QRCODE(
            qrCodeLastId,
            _amount,                 // amount
            msg.sender,             // minter
            address(0),             // claimer
            block.timestamp,        // minted_at
            0,                      // claimed_at
            qrTL,
            address(router),        // router
            _message                // message
        );

        qrCodesRouters[address(router)] = qrCodeLastId;
        mintedAmount[msg.sender]+=_amount;
        totalMintedAmount+=_amount;
        mintedQrCodes[msg.sender].push(qrCodeLastId);
        mintedQrCodesCount[msg.sender]++;

        qrCodesLength++;

        emit QrCodeMinted(address(router));
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
        totalQrCodesClaimed++;
        claimedByMinter[qrCodes[qrCodeId].minter]+=qrCodes[qrCodeId].amount;
        totalClaimedAmount+=qrCodes[qrCodeId].amount;

        qrCodes[qrCodeId].claimer = claimer;
        qrCodes[qrCodeId].claimed_at = block.number;
    
        claimers.add(claimer);
        // Move token
        IERC20(tokenAddress).transfer(claimer, qrCodes[qrCodeId].amount);
        // Faucet test
        uint256 claimerBalance = claimer.balance;
        if (claimerBalance < faucetAmount) {
            uint256 needAmount = faucetAmount - claimer.balance;
            totalFaucetAmount+=needAmount;
            claimer.call{value: needAmount}("");
        }
        
    }
    
}