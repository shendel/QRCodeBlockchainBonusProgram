// SPDX-License-Identifier: MIT
/*
    Контракт управления qr-кодами
*/
pragma solidity ^0.8.12;

import "./AddressSet.sol";
import "./IERC20.sol";
import "./QRCodeClaimer/IQRCodeClaimer.sol";
import "./QRCodeClaimer/IDeployerQRCodeClaimer.sol";
import "./BanList/IBannedClaimers.sol";
import "./Minters/IQRCodeMinters.sol";

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

    mapping (uint256 => QRCODE) public qrCodes;
    mapping (address => uint256) public qrCodesRouters;
    uint256 private qrCodeLastId = 0;
    uint256 public qrCodesLength = 0;

    uint256 public totalQrCodesClaimed = 0;
    uint256 public totalMintedAmount = 0;
    uint256 public totalClaimedAmount = 0;
    uint256 public totalFaucetAmount = 0;

    IQRCodeMinters public minters;
    function setMinters(address newMinters) onlyOwner public {
        minters = IQRCodeMinters(newMinters);
    }
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
    /*
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
*/
    struct ClaimerInfo {
        address claimerAddress;
        uint256 claimedAmount;
        uint256[] claimedQrCodes;
        uint256 claimedQrCodesCount;
        uint256 faucetUsed;
        bool isBanned;
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
    // Максимальное кол-во токенов в коде
    uint256 public maxMintAmountPerQrCodeGlobal = 0.0001 ether;
    // Максимальное кол-во токенов в коде для отдельного минтера
    //mapping (address => uint256) maxMintAmountPerQrCode;
    

    // Banlist
    IBannedClaimers public banlist;
    function setBanList(address newBanList) onlyOwner public {
        banlist = IBannedClaimers(newBanList);
    }

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
        require(minters.getIsMinter(msg.sender) == true, "Only for minters");
        _;
    }

    receive() external payable {}

    constructor(address _tokenAddress) {
        owner = msg.sender;
        managers.add(msg.sender);
        //minters.add(msg.sender);
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
        minters.setIsMinter(who, isMinter);
    }
    function setMinterName(address minter, string memory name) onlyManager public {
        minters.setMinterName(minter, name);
    }
    function addMinter(address minter, string memory name) onlyManager public {
        minters.addMinter(minter, name);
    }
    function setMaxMintAmountPerQrCodeGlobal(uint256 newLimit) onlyManager public {
        maxMintAmountPerQrCodeGlobal = newLimit;
    }
    function setMaxMintAmountPerQrCode(address minter, uint256 newLimit) onlyManager public {
        minters.setMaxMintAmountPerQrCode(minter, newLimit);
    }
    function setMinterBalance(address minter, uint256 newBalance) onlyManager public {
        minters.setMinterBalance(minter, newBalance);
    }
    function addMinterBalance(address minter, uint256 amount) onlyManager public {
        minters.addMinterBalance(minter, amount);
    }

    function addClaimerBan(
        address claimer,
        string memory why
    ) onlyManager public {
        banlist.addClaimerBan(claimer, why);
    }
    function delClaimerBan(
        address claimer
    ) public {
        banlist.delClaimerBan(claimer);
    }
    /* Getters */
    function isBannedClaimer(address who) public view returns (bool) {
        return banlist.isBannedClaimer(who);
    }
    function getBannedClaimersCount() public view returns (uint256) {
        return banlist.getBannedClaimersCount();
    }
    function getBannedClaimers(
        uint256 offset,
        uint256 limit
    ) public view returns (IBannedClaimers.BannedClaimer[] memory) {
        return banlist.getBannedClaimers(offset, limit);
    }
    /* ---- */
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
    function getManagersCount() public view returns (uint256) {
        return managers.length();
    }
    function getManagers() public view returns (address[] memory) {
        return managers.items(0,0);
    }
    function getIsMinter(address check) public view returns (bool) {
        return minters.getIsMinter(check);
    }
    function getMintersCount() public view returns (uint256) {
        return minters.getMintersCount();
    }
    function getMinters() public view returns (address[] memory) {
        return minters.getMinters();
    }
    function getMintersInfo() public view returns (IQRCodeMinters.MinterInfo[] memory) {
        return minters.getMintersInfo();
    }
    function getMinterInfo(address minter) public view returns (IQRCodeMinters.MinterInfo memory ret) {
        return minters.getMinterInfo(minter);
    }

    function getMinterQrCodes(
        address minter,
        uint256 offset,
        uint256 limit
    ) public view returns (QRCODE[] memory) {
        uint256[] memory minterQrCodes = minters.getMinterQrCodesId(minter, offset, limit);
        QRCODE[] memory ret = new QRCODE[](minterQrCodes.length);
        for (uint256 i = 0; i < minterQrCodes.length; i++) {
            ret[i] = qrCodes[minterQrCodes[i]];
        }
        return ret;
    }
    
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
                banlist.isBannedClaimer(claimer)
            );
        }
    }
    function getClaimers(uint256 offset, uint256 limit) public view returns (address[] memory) {
        return claimers.items(offset, limit);
    }
    
    function getClaimedQrCodes(
        address claimer,
        uint256 offset,
        uint256 limit
    ) public view returns (QRCODE[] memory) {
        uint256 size = claimedQrCodes[claimer].length;
        if (limit != 0) {
            size = limit;
        }
        uint256 iEnd = offset + size;
        if (iEnd > claimedQrCodes[claimer].length) {
            iEnd = claimedQrCodes[claimer].length;
        }
        QRCODE[] memory ret = new QRCODE[](iEnd - offset);
        for (uint256 i = 0; i < iEnd - offset ; i++) {
            ret[i] = qrCodes[claimedQrCodes[claimer][
                claimedQrCodes[claimer].length - i - offset - 1
            ]];
        }
        return ret;
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
        
        address router = deployerQRCodeClaimer.deploy(
            tokenAddress,
            msg.sender,
            _amount,
            block.timestamp,
            qrTL,
            minters.getMinterName(msg.sender),
            _message
        );

        qrCodeLastId++;
        qrCodes[qrCodeLastId] = QRCODE(
            qrCodeLastId,
            _amount,                 // amount
            msg.sender,             // minter
            address(0),             // claimer
            address(0),             // claimer_call
            block.timestamp,        // minted_at
            0,                      // claimed_at
            qrTL,
            router,                 // router
            _message                // message
        );

        qrCodesRouters[router] = qrCodeLastId;
        totalMintedAmount+=_amount;

        minters.addQrCode(msg.sender, _amount, qrCodeLastId);

        qrCodesLength++;

        emit QrCodeMinted(router);
        return (router);
    }

    function claim(address claimer, address claimer_call) public {
        require(qrCodesRouters[msg.sender] != 0, "Call not from router");
        uint256 qrCodeId = qrCodesRouters[msg.sender];
        require(qrCodes[qrCodeId].minted_at != 0, "This code not minted yet");
        require(qrCodes[qrCodeId].claimed_at == 0, "This code already claimed");
        require(qrCodes[qrCodeId].minted_at + qrCodes[qrCodeId].timelife > block.timestamp, "QrCode is expired");

        claimedAmount[claimer]+=qrCodes[qrCodeId].amount;
        claimedQrCodes[claimer].push(qrCodeId);
        claimedQrCodesCount[claimer]++;
        totalQrCodesClaimed++;
        minters.onClaim(qrCodes[qrCodeId].minter, qrCodes[qrCodeId].amount);
        totalClaimedAmount+=qrCodes[qrCodeId].amount;

        qrCodes[qrCodeId].claimer = claimer;
        qrCodes[qrCodeId].claimer_call = claimer_call;
        qrCodes[qrCodeId].claimed_at = block.number;
    
        claimers.add(claimer);
        // Move token
        IERC20(tokenAddress).transfer(claimer, qrCodes[qrCodeId].amount);
        // Faucet test
        uint256 claimerBalance = claimer.balance;
        if (claimerBalance < faucetAmount) {
            uint256 needAmount = faucetAmount - claimer.balance;
            totalFaucetAmount+=needAmount;
            claimedFaucetUsed[claimer]+=needAmount;
            payable(claimer).transfer(needAmount);
            //claimer.call{value: needAmount}("");
        }
        
    }
    
    // ------ Manage system settings
    IDeployerQRCodeClaimer public deployerQRCodeClaimer;
    function setDeployerQRCodeClaimer(address addr) onlyOwner public {
        deployerQRCodeClaimer = IDeployerQRCodeClaimer(addr);
    }
}