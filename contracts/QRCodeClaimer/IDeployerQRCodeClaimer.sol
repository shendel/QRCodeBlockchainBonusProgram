// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

interface IDeployerQRCodeClaimer {
    function deploy(
        address _tokenAddress,
        address _minter,
        uint256 _amount,
        uint256 _created_at,
        uint256 _timelife,
        string memory _minterName,
        string memory _message
    ) external returns (address);
}