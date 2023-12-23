// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import "./IERC20.sol";
import "./IQRCodeFactory.sol";

contract QRCodeClaimer {
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

    
    constructor (
        address _tokenAddress,
        address _minter,
        uint256 _amount,
        uint256 _created_at,
        uint256 _timelife,
        string memory _minterName,
        string memory _message
    ) {
        factory = IQRCodeFactory(payable(msg.sender));
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
