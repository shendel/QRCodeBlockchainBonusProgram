// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

interface IBannedClaimers {
    struct BannedClaimer {
        address claimer;
        address who;
        string why;
        uint256 when;
    }
    function setOwner(address newOwner) external;
    function setFactory(address newFactory) external;

    function bannedClaimersWho(address claimer) external view returns (address);
    function bannedClaimersWhy(address claimer) external view returns (string memory);
    function bannedClaimersWhen(address claimer) external view returns (uint256);

    function addClaimerBan(address claimer, string memory why) external;
    function delClaimerBan(address claimer) external;
    function isBannedClaimer(address who) external view returns (bool);
    function getBannedClaimersCount() external view returns (uint256);
    function getBannedClaimers(uint256 offset,uint256 limit) external view returns (BannedClaimer[] memory);
}