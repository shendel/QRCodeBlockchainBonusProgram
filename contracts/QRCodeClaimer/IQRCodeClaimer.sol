// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;
import "../IERC20.sol";
import "../IQRCodeFactory.sol";

interface IQRCodeClaimer {
    function factory() external view returns (IQRCodeFactory);
    function token() external view returns (IERC20);
    function minter() external view returns (address);
    function amount() external view returns (uint256);

    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
    function decimals() external view returns (uint8);

    function minterName() external view returns (string memory);
    function message() external view returns (string memory);

    function created_at() external view returns (uint256);
    function timelife() external view returns (uint256);

    function setNotValid() external;
    function isValid() external view returns (bool);
    function isClaimed() external view returns (bool);
    function claim(address claimer) external;
}
