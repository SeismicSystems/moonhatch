// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.27;

import { ISRC20 } from "./ISRC20.sol";
import { IERC20Uniswap } from "../dex/interfaces/IERC20.sol";

interface IPumpCoin is ISRC20, IERC20Uniswap {
    function decimals() external view override(ISRC20, IERC20Uniswap) returns (uint8);
    function name() external view override(ISRC20, IERC20Uniswap) returns (string memory);
    function symbol() external view override(ISRC20, IERC20Uniswap) returns (string memory);
    function totalSupply() external view override(ISRC20, IERC20Uniswap) returns (uint256);
    function mint(saddress to, suint256 amount) external;
    function graduate() external;
}
