// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import "../IERC20.sol";
import "../AddressSet.sol";

contract BonusBridge {
    using AddressSet for AddressSet.Storage;

    uint256 public refundTime = 1 hours;
    AddressSet.Storage private owners;
    address public oracle;
    address public token;
    
    struct SwapIn {
        uint256 swapId;
        address fromAddress;
        address toAddress;
        uint256 inAmount;
        uint256 outAmount;
        uint256 utx;
    }

    struct SwapOut {
        uint256 swapId;
        address fromAddress;
        address toAddress;
        uint256 inAmount;
        uint256 outAmount;
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

    uint8 public outTokenDecimals = 18;
    uint8 public inTokenDecimals = 18;
    uint256 public outToInRate = 1;

    constructor(
        address _oracle,
        address _token,
        uint8 _inTokenDecimals,
        uint8 _outTokenDecimals,
        uint256 _outToInRate
    ) {
        owners.add(msg.sender);
        oracle = _oracle;
        token = _token;
        outTokenDecimals = _outTokenDecimals;
        inTokenDecimals = _inTokenDecimals;
        outToInRate = _outToInRate;
    }

    function setOutTokenDecimals(uint8 _decimals) public onlyOwner {
        outTokenDecimals = _decimals;
    }
    function setInTokenDecimals(uint8 _decimals) public onlyOwner {
        inTokenDecimals = _decimals;
    }
    function setOutToInRate(uint256 _rate) public onlyOwner {
        outToInRate = _rate;
    }
    function calcInAmount(uint256 outAmount) public view returns (uint256) {
        return outAmount / 10 ** outTokenDecimals * (10 ** inTokenDecimals) * outToInRate;
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

    event onSwapIn(uint256 swapId, address from, address to, uint256 inAmount, uint256 outAmount);

    function swapIn(
        uint256 swapId,
        address fromAddress,
        address toAddress,
        uint256 outAmount
    ) public onlyOracle {
        require(swapsIn[swapId].swapId == 0, "Swap already in");
        // Calc in amount by rate and decimals
        uint256 inAmount = calcInAmount(outAmount);
        require(IERC20(token).balanceOf(address(this)) >= inAmount, "Balance on contract not enought");

        swapsIn[swapId] = SwapIn(
            swapId,
            fromAddress,
            toAddress,
            inAmount,
            outAmount,
            block.timestamp
        );

        IERC20(token).transfer(toAddress, inAmount);

        emit onSwapIn(
            swapId,
            fromAddress,
            toAddress,
            inAmount,
            outAmount
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
        require(IERC20(token).balanceOf(address(this)) >= swapsOut[swapId].outAmount, "Balance on Bridge not enought");
        
        swapsOut[swapId].refunded = true;
        _swapsOutQueryDel(swapId);

        IERC20(token).transfer(swapsOut[swapId].fromAddress, swapsOut[swapId].outAmount);
        emit onSwapOutRefund(swapId, msg.sender);
    }

    event onSwapOut(uint256 swapId, address from, address to, uint256 inAmount, uint256 outAmount);

    function swapOut(
        address toAddress,
        uint256 outAmount
    ) public {
        require(msg.sender == tx.origin, "Contract call not allowed");
        require(IERC20(token).balanceOf(msg.sender) >= outAmount, "Balance not enought");
        require(IERC20(token).allowance(msg.sender, address(this)) >= outAmount, "Allowance not enought");

        // Calc inAmount from outAmount and rate and decimals
        uint256 inAmount = calcInAmount(outAmount);

        lastSwapOutId++;
        swapsOut[lastSwapOutId] = SwapOut(
            lastSwapOutId,
            msg.sender,
            toAddress,
            inAmount,
            outAmount,
            block.timestamp,
            block.number,
            false,
            false,
            0x00
        );
        swapsOutByOwner[msg.sender].push(lastSwapOutId);
        _swapsOutQueryAdd(lastSwapOutId);

        IERC20(token).transferFrom(msg.sender, address(this), outAmount);

        emit onSwapOut(
            lastSwapOutId,
            msg.sender,
            toAddress,
            inAmount,
            outAmount
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
        require(owner != address(0), "Owner address cant be zero");
        if(!owners.exists(owner)) owners.add(owner);
    }
    function delOwner(address owner) public onlyOwner {
        if(owners.exists(owner)) owners.del(owner);
    }
    function getOwners() public view returns(address[] memory) {
        return owners.items(0,0);
    }
}