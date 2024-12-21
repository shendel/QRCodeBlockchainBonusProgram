// SPDX-License-Identifier: MIT

pragma solidity ^0.8.12;

import "../AddressSet.sol";
import "../IQRCodeFactory.sol";

contract QRCodeClimers {
    using AddressSet for AddressSet.Storage;
    IQRCodeFactory public factory;

    address owner;
    modifier onlyOwner() {
        require(msg.sender == owner, "Only for owner");
        _;
    }
    modifier onlyManager() {
        require(factory.getIsManager(tx.origin) == true, "Only for managers");
        _;
    }
    modifier onlyFactory() {
        require(address(factory) == msg.sender, "Only for factory");
        _;
    }
    constructor() {
        owner = msg.sender;
    }

    function setOwner(address newOwner) onlyOwner public {
        require(address(0) == newOwner, "Owner cant be zero");
        owner = newOwner;
    }

    function setFactory(address newFactory) onlyOwner public {
        factory = IQRCodeFactory(newFactory);
    }
}