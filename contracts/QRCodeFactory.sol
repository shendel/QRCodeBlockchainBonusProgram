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
import "./Claimers/IQRCodeClaimers.sol";
import "./IQRCodeFactory.sol";

contract QRCodeFactory is IQRCodeFactory {
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


    mapping (uint256 => QRCODE) public _qrCodes;
    function qrCodes(uint256 id) public view returns (QRCODE memory) {
        return _qrCodes[id];
    }
    mapping (address => uint256) public qrCodesRouters;
    mapping (uint256 => address) public qrCodesRoutersById;
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
    IQRCodeClaimers public claimers;
    function setClaimers(address newClaimers) onlyOwner public {
        claimers = IQRCodeClaimers(newClaimers);
    }
    // Максимальное кол-во токенов в коде
    uint256 public maxMintAmountPerQrCodeGlobal = 0.0001 ether;

    // Banlist
    IBannedClaimers public banlist;
    function setBanList(address newBanList) onlyOwner public {
        banlist = IBannedClaimers(newBanList);
    }

    AddressSet.Storage private managers;


    address public oracle;

    modifier onlyManagerOrOracle() {
        require((msg.sender == oracle) || managers.exists(msg.sender), "Only for oracle or manager");
        _;
    }
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
        tokenAddress = _tokenAddress;
    }
    /* Setters */
    function setOracle(address newOracle) onlyOwner public {
        oracle = newOracle;
    }
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
    function addMinterBalance(address minter, uint256 amount) onlyManagerOrOracle public {
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
    function getBannedClaimersWho(address claimer) public view returns (address) {
        return banlist.bannedClaimersWho(claimer);
    }
    function getBannedClaimersWhy(address claimer) public view returns (string memory) {
        return banlist.bannedClaimersWhy(claimer);
    }
    function getBannedClaimersWhen(address claimer) public view returns (uint256) {
        return banlist.bannedClaimersWhen(claimer);
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
            retCodes[curId-1] = _qrCodes[curId];
        }
        return retCodes;
    }
    function getQrCode(uint256 index) public view returns (QRCODE memory) {
        return _qrCodes[index];
    }
    function getQrCodeByAddress(address router) public view returns (QRCODE memory ret) {
        if (qrCodesRouters[router] != 0) {
            return _qrCodes[qrCodesRouters[router]];
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
    function getMintersInfo(bool skipCodesIds) public view returns (IQRCodeMinters.MinterInfo[] memory) {
        return minters.getMintersInfo(skipCodesIds);
    }
    function getMinterInfo(address minter, bool skipCodesIds) public view returns (IQRCodeMinters.MinterInfo memory ret) {
        return minters.getMinterInfo(minter, skipCodesIds);
    }

    function getQrCodesByIds(uint256[] memory ids) public view returns(QRCODE[] memory) {
        QRCODE[] memory ret = new QRCODE[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            ret[i] = _qrCodes[ids[i]];
        }
        return ret;
    }
    function getMinterQrCodes(
        address minter,
        uint256 offset,
        uint256 limit
    ) public view returns (QRCODE[] memory) {
        uint256[] memory minterQrCodes = minters.getMinterQrCodesIds(minter, offset, limit);
        return getQrCodesByIds(minterQrCodes);
    }
    function getMinterClimedQrCodes(
        address minter,
        uint256 offset,
        uint256 limit
    ) public view returns (QRCODE[] memory) {
        uint256[] memory minterQrCodes = minters.getMinterClaimedQrCodesIds(minter, offset, limit);
        return getQrCodesByIds(minterQrCodes);
    }
    
    function getClaimersCount() public view returns (uint256) {
        return claimers.getClaimersCount();
    }
    function getClaimersInfo(
        uint256 offset,
        uint256 limit
    ) public view returns (IQRCodeClaimers.ClaimerInfo[] memory) {
        return claimers.getClaimersInfo(offset, limit);
    }
    function getClaimerInfo(address claimer) public view returns (IQRCodeClaimers.ClaimerInfo memory ret) {
        return claimers.getClaimerInfo(claimer);
    }
    function getClaimers(uint256 offset, uint256 limit) public view returns (address[] memory) {
        return claimers.getClaimers(offset, limit);
    }
    
    function getClaimedQrCodes(
        address claimer,
        uint256 offset,
        uint256 limit
    ) public view returns (IQRCodeFactory.QRCODE[] memory) {
        return claimers.getClaimedQrCodes(claimer, offset, limit);
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
        uint256 qrCodeId = qrCodesRouters[router];
        return qrCodeId != 0 && _qrCodes[qrCodeId].claimed_at != 0;
    }
    /* ---- */
    
    function mint
        (uint256 _amount,
        uint256 _timelife,
        string memory _message
    ) onlyMinter public returns (address) {
        uint256 qrTL = (_timelife == 0) ? codeTL : _timelife;

        qrCodeLastId++;
        
        minters.addQrCode(msg.sender, _amount, qrCodeLastId);

        _qrCodes[qrCodeLastId] = QRCODE({
            id: qrCodeLastId,
            amount: _amount,
            minter: msg.sender,
            claimer: address(0),
            claimer_call: address(0),
            minted_at: block.timestamp,
            claimed_at: 0,
            timelife: qrTL,
            router: deployerQRCodeClaimer.deploy(
                tokenAddress,
                msg.sender,
                _amount,
                block.timestamp,
                qrTL,
                minters.getMinterName(msg.sender),
                _message
            ),
            message: _message
        });

        qrCodesRouters[_qrCodes[qrCodeLastId].router] = qrCodeLastId;
        qrCodesRoutersById[qrCodeLastId] = _qrCodes[qrCodeLastId].router;
        totalMintedAmount+=_amount;

        qrCodesLength++;

        emit QrCodeMinted(_qrCodes[qrCodeLastId].router);
        return (_qrCodes[qrCodeLastId].router);
    }

    function claim(address claimer, address claimer_call) public {
        require(qrCodesRouters[msg.sender] != 0, "Call not from router");
        uint256 qrCodeId = qrCodesRouters[msg.sender];
        QRCODE storage qrCode = _qrCodes[qrCodeId];
        require(IERC20(tokenAddress).balanceOf(address(this)) >= qrCode.amount, "Low token balance at Factory, contact tech support");

        claimers.onClaim(
            claimer,
            qrCode.amount,
            qrCodeId
        );

        unchecked {
            totalQrCodesClaimed++;
            totalClaimedAmount+=qrCode.amount;
        }
        
        minters.onClaim(
            qrCode.minter,
            qrCodeId,
            qrCode.amount
        );

        qrCode.claimer = claimer;
        qrCode.claimer_call = claimer_call;
        qrCode.claimed_at = block.timestamp;
    
        // Move token
        IERC20(tokenAddress).transfer(claimer, qrCode.amount);
        // Faucet energy
        uint256 claimerBalance = claimer.balance;
        if (claimerBalance < faucetAmount && address(this).balance >= faucetAmount) {
            uint256 needAmount = faucetAmount - claimer.balance;
            totalFaucetAmount+=needAmount;
            claimers.addFaucetUsed(claimer, needAmount);
            payable(claimer).transfer(needAmount);
        }
    }
    
    // ------ Manage system settings
    function withdrawFunds() onlyOwner public {
        IERC20(tokenAddress).transfer(msg.sender, IERC20(tokenAddress).balanceOf(address(this)));
        payable(msg.sender).transfer(address(this).balance);
    }
    IDeployerQRCodeClaimer public deployerQRCodeClaimer;
    function setDeployerQRCodeClaimer(address addr) onlyOwner public {
        deployerQRCodeClaimer = IDeployerQRCodeClaimer(addr);
    }
}