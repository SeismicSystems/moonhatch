// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.27;

/*
 * Assumption:
 * The custom types `saddress` and `suint256` are defined elsewhere.
 * They are identical in behavior to address and uint256 respectively,
 * but signal that the underlying data is stored privately.
 */

/*//////////////////////////////////////////////////////////////
//                        ISRC20 Interface
//////////////////////////////////////////////////////////////*/

interface ISRC20 {
    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
    function totalSupply() external view returns (uint256);
    function decimals() external view returns (uint8);

    function transfer(saddress to, suint256 value) external returns (bool);
    function transferFrom(saddress from, saddress to, suint256 value) external returns (bool);
    function approve(saddress spender, suint256 value) external returns (bool);

    /// @dev owner passed in as msg.sender via signedRead
    function balanceOf() external view returns (uint256);
    function allowance(saddress spender) external view returns (uint256);
}
