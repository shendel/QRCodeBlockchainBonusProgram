// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

interface IQRCodeFactory {
    function isQrCodeClaimed(address codeAddress) external view returns (bool);
    function claim(address codeAddress) external;
}