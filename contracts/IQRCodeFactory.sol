// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

interface IQRCodeFactory {
    function isQrCodeClaimed(address codeAddress) external view returns (bool);
    function claim(address claimer, address claimer_call) external;
    function isBannedClaimer(address who) external view returns (bool);
    function getIsManager(address check) external view returns (bool);
}