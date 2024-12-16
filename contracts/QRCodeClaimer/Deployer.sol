// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import "../IQRCodeFactory.sol";
import "./QRCodeClaimer.sol";

contract DeployerQRCodeClaimer {
    IQRCodeFactory public factory;
    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only for owner");
        _;
    }
    modifier onlyCallFromFactory() {
        require(address(factory) == msg.sender, "Only for factory");
        _;
    }
    
    constructor () {
        owner = msg.sender;
    }
    function setOwner(address newOwner) onlyOwner public {
        owner = newOwner;
    }
    function setFactory(address newFactory) onlyOwner public {
        factory = IQRCodeFactory(newFactory);
    }

    address public lastDeployed;

    function deploy(
        address _tokenAddress,
        address _minter,
        uint256 _amount,
        uint256 _created_at,
        uint256 _timelife,
        string memory _minterName,
        string memory _message
    ) onlyCallFromFactory public returns (address) {
        QRCodeClaimer claimer = new QRCodeClaimer(
                address(factory),
                _tokenAddress,
                _minter,
                _amount,
                _created_at,
                _timelife,
                _minterName,
                _message
            );
        return address(claimer);
    }
}