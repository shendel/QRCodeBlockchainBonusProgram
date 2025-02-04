// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import "../IERC20.sol";
import "../IQRCodeFactory.sol";
import "./IQRCodeClaimer.sol";

contract QRCodeClaimer is IQRCodeClaimer {
    IQRCodeFactory public factory;
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

    bool public _isValid = true;

    constructor (
        address _factory,
        address _tokenAddress,
        address _minter,
        uint256 _amount,
        uint256 _created_at,
        uint256 _timelife,
        string memory _minterName,
        string memory _message
    ) {
        factory = IQRCodeFactory(payable(_factory));
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

    function getSummaryInfo() public view returns (SummaryInfo memory) {
        return SummaryInfo(
            address(token),
            decimals,
            symbol,
            name,
            minter,
            amount,
            minterName,
            message,
            created_at,
            timelife,
            isValid(),
            isClaimed()
        );
    }

    function setNotValid() public {
        require(msg.sender == address(factory), "Not allowed");
        _isValid = false;
    }
    function isValid() public view returns (bool) {
        if (!_isValid) return false;
        return (created_at + timelife) > block.timestamp;
    }
    function isExpired() public view returns (bool) {
        return (created_at + timelife) > block.timestamp;
    }
    
    function isClaimed() public view returns (bool) {
        return factory.isQrCodeClaimed(address(this));
    }

    function claim(address claimer) public {
        require(!isClaimed(), "QRCode already claimed");
        require(isValid(), "QRCode not valid");
        require(tx.origin == msg.sender, "Contract call not allowed");

        require(factory.isBannedClaimer(msg.sender) == false, "Banned");
        if (claimer != address(0)) {
            require(factory.isBannedClaimer(claimer) == false, "Banned");
        }

        factory.claim((claimer == address(0)) ? msg.sender : claimer, msg.sender);
    }
}
