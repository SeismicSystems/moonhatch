// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.27;

import {Test, console} from "forge-std/Test.sol";
import { WETH9 } from "../src/dex/mocks/WETH9.sol";
import { UniswapV2Factory } from "../src/dex/UniswapV2Factory.sol";
import { UniswapV2Router02 } from "../src/dex/UniswapV2Router02.sol";

contract SushiSwapTest is Test {
    WETH9 public weth9;
    UniswapV2Factory public factory;
    UniswapV2Router02 public router;

    function setUp() public {
        address feeTo = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266;
        weth9 = new WETH9();
        factory = new UniswapV2Factory(feeTo);
        router = new UniswapV2Router02(address(weth9), address(factory));
    }

    function testProvideLiquidity() public {
        // router.addLiquidity(tokenA, tokenB, amountADesired, amountBDesired, amountAMin, amountBMin, to, deadline);
    }
}