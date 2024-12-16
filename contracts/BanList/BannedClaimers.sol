// SPDX-License-Identifier: MIT
/*
    Контракт банами 
*/
pragma solidity ^0.8.12;

import "../AddressSet.sol";
import "../IQRCodeFactory.sol";

contract BannedClaimers {
    using AddressSet for AddressSet.Storage;
    IQRCodeFactory public factory;
    address public owner;
    // Banlist
    struct BannedClaimer {
        address claimer;
        address who;
        string why;
        uint256 when;
    }
    AddressSet.Storage private bannedClaimers;
    mapping (address => address) public bannedClaimersWho;
    mapping (address => string) public bannedClaimersWhy;
    mapping (address => uint256) public bannedClaimersWhen;

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

    function addClaimerBan(
        address claimer,
        string memory why
    ) onlyManager onlyFactory public {
        bannedClaimers.add(claimer);
        bannedClaimersWho[claimer] = msg.sender;
        bannedClaimersWhy[claimer] = why;
        bannedClaimersWhen[claimer] = block.timestamp;
    }
    function delClaimerBan(
        address claimer
    ) onlyManager onlyFactory public {
        bannedClaimers.del(claimer);
    }
    /* Getters */
    function isBannedClaimer(address who) public view returns (bool) {
        return bannedClaimers.exists(who);
    }
    function getBannedClaimersCount() public view returns (uint256) {
        return bannedClaimers.length();
    }
    function getBannedClaimers(
        uint256 offset,
        uint256 limit
    ) public view returns (BannedClaimer[] memory) {
        address[] memory items = bannedClaimers.items(offset, limit);
        BannedClaimer[] memory ret = new BannedClaimer[](items.length);
        for (uint256 i = 0; i < items.length; i++) {
            ret[i] = BannedClaimer(
                items[i],
                bannedClaimersWho[items[i]],
                bannedClaimersWhy[items[i]],
                bannedClaimersWhen[items[i]]
            );
        }
        return ret;
    }
}