// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import "./IERC20.sol";
import "./AddressSet.sol";
import "./BanList/IBannedClaimers.sol";

contract SimpleERC20Bridge {
    using AddressSet for AddressSet.Storage;

    uint256 public refundTime = 1 hours;
    AddressSet.Storage private owners;
    address public oracle;
    address public token;
    
    IBannedClaimers public blacklist;

    struct SwapIn {
        uint256 swapId;
        address fromAddress;
        address toAddress;
        uint256 amount;
        uint256 utx;
    }

    struct SwapOut {
        uint256 swapId;
        address fromAddress;
        address toAddress;
        uint256 amount;
        uint256 utx;
        uint256 blocknumber;
        bool swapped;
        bool refunded;
        bytes32 inHash;
    }

    modifier onlyOracle() {
        require(msg.sender == oracle, "Only for oracle");
        _;
    }
    modifier onlyOwner() {
        require(owners.exists(msg.sender) == true, "Only for owner");
        _;
    }

    mapping (uint256 => SwapOut) public swapsOut;
    mapping (address => uint256[]) public swapsOutByOwner;

    uint256[] public swapsOutQuery;
    mapping (uint256 => bool) public swapsOutQueryExists;
    uint256 public lastSwapOutId;
    
    mapping (uint256 => SwapIn) public swapsIn;


    constructor(
        address _oracle,
        address _token,
        address _blacklist
    ) {
        owners.add(msg.sender);
        oracle = _oracle;
        token = _token;
        blacklist = IBannedClaimers(_blacklist);
    }

    function _swapsOutQueryAdd(uint256 swapId) private {
        if (!swapsOutQueryExists[swapId]) {
            swapsOutQuery.push(swapId);
            swapsOutQueryExists[swapId] = true;
        }
    }
    
    function _swapsOutQueryDel(uint256 swapId) private {
        if (swapsOutQueryExists[swapId]) {
            swapsOutQueryExists[swapId] = false;
            if (swapsOutQuery[swapsOutQuery.length-1] == swapId) {
                swapsOutQuery.pop();
                return;
            }
            for(uint256 i = 0; i < swapsOutQuery.length; i++) {
                if (swapsOutQuery[i] == swapId) {
                    swapsOutQuery[i] = swapsOutQuery[swapsOutQuery.length -1];
                    swapsOutQuery.pop();
                    return;
                }
            }
        }
    }

    event onSwapIn(uint256 swapId, address from, address to, uint256 amount);

    function swapIn(
        uint256 swapId,
        address fromAddress,
        address toAddress,
        uint256 amount
    ) public onlyOracle {
        require(swapsIn[swapId].swapId == 0, "Swap already in");
        require(IERC20(token).balanceOf(address(this)) >= amount, "Balance on contract not enought");

        swapsIn[swapId] = SwapIn(
            swapId,
            fromAddress,
            toAddress,
            amount,
            block.timestamp
        );

        IERC20(token).transfer(toAddress, amount);

        emit onSwapIn(
            swapId,
            fromAddress,
            toAddress,
            amount
        );
    }

    function getNextSwapOut() public view returns(SwapOut memory ret) {
        if (swapsOutQuery.length > 0) {
            ret = swapsOut[swapsOutQuery[0]];
        }
        return ret;
    }

    event onSwapOutReady(uint256 swapId, bytes32 inHash);

    function swapOutReady(
        uint256 swapId,
        bytes32 inHash
    ) public onlyOracle {
        swapsOut[swapId].swapped = true;
        swapsOut[swapId].inHash = inHash;
        _swapsOutQueryDel(swapId);
        emit onSwapOutReady(swapId, inHash);
    }

    event onSwapOutRefund(uint256 swapId, address refunder);

    function swapOutRefund(
        uint256 swapId
    ) public {
        require(swapsOut[swapId].swapped == false, "Swap already swapped");
        require(swapsOut[swapId].refunded == false, "Swap already refunded");
        require(block.timestamp > swapsOut[swapId].utx + refundTime, "Refund timeout freeze");
        require(IERC20(token).balanceOf(address(this)) >= swapsOut[swapId].amount, "Balance on Bridge not enought");
        
        swapsOut[swapId].refunded = true;
        _swapsOutQueryDel(swapId);

        IERC20(token).transfer(swapsOut[swapId].fromAddress, swapsOut[swapId].amount);
        emit onSwapOutRefund(swapId, msg.sender);
    }

    event onSwapOut(uint256 swapId, address from, address to, uint256 amount);

    function swapOut(
        address toAddress,
        uint256 amount
    ) public {
        require(blacklist.isBannedClaimer(msg.sender) == false, "Blacklisted");
        require(msg.sender == tx.origin, "Contract call not allowed");
        require(blacklist.isBannedClaimer(toAddress) == false, "Blacklisted");
        require(IERC20(token).balanceOf(msg.sender) >= amount, "Balance not enought");
        require(IERC20(token).allowance(msg.sender, address(this)) >= amount, "Allowance not enought");

        lastSwapOutId++;
        swapsOut[lastSwapOutId] = SwapOut(
            lastSwapOutId,
            msg.sender,
            toAddress,
            amount,
            block.timestamp,
            block.number,
            false,
            false,
            0x00
        );
        swapsOutByOwner[msg.sender].push(lastSwapOutId);
        _swapsOutQueryAdd(lastSwapOutId);

        IERC20(token).transferFrom(msg.sender, address(this), amount);

        emit onSwapOut(
            lastSwapOutId,
            msg.sender,
            toAddress,
            amount
        );
    }

    
    function getSwapsOQuery() public view returns(uint256[] memory) {
        return swapsOutQuery;
    }
    function swapOutQueryAdd(uint256 swapId) public onlyOwner {
        _swapsOutQueryAdd(swapId);
    }
    function swapOutQueryDel(uint256 swapId) public onlyOwner {
        _swapsOutQueryDel(swapId);
    }
    function setOracle(address newOracle) public onlyOwner {
        oracle = newOracle;
    }
    function setToken(address newToken) public onlyOwner {
        token = newToken;
    }
    function setBlacklist(address newBlacklist) public onlyOwner {
        blacklist = IBannedClaimers(newBlacklist);
    }
    function getTokenName() public view returns (string memory) {
        return IERC20(token).name();
    }
    function getTokenSymbol() public view returns (string memory) {
        return IERC20(token).symbol();
    }
    function getTokenDecimals() public view returns (uint8) {
        return IERC20(token).decimals();
    }
    function getBalance() public view returns (uint256) {
        return IERC20(token).balanceOf(address(this));
    }
    function safeTokens(address tokenAddress, address to) public onlyOwner {
        IERC20(token).transfer(to, IERC20(tokenAddress).balanceOf(address(this)));
    }
    function withdrawTokens(address to) public onlyOwner {
        IERC20(token).transfer(to, IERC20(token).balanceOf(address(this)));
    }

    function addOwner(address owner) public onlyOwner {
        if(!owners.exists(owner)) owners.add(owner);
    }
    function delOwner(address owner) public onlyOwner {
        if(owners.exists(owner)) owners.del(owner);
    }
    function getOwners() public view returns(address[] memory) {
        return owners.items(0,0);
    }
}