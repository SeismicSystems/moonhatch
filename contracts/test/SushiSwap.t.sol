// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.27;

import {Test, console} from "forge-std/Test.sol";
import { MockERC20 } from "forge-std/mocks/MockERC20.sol";
import { WETH9 } from "../src/dex/mocks/WETH9.sol";
import { UniswapV2Factory } from "../src/dex/UniswapV2Factory.sol";
import { UniswapV2Router02 } from "../src/dex/UniswapV2Router02.sol";

contract ERC20 is MockERC20 {
    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}

contract SushiSwapTest is Test {
    WETH9 public weth9;
    UniswapV2Factory public factory;
    UniswapV2Router02 public router;
    ERC20 public token;
    
    function setUp() public {
        address feeTo = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266;
        weth9 = new WETH9();
        factory = new UniswapV2Factory(feeTo);
        router = new UniswapV2Router02(address(factory), address(weth9));
        token = new ERC20();
        token.initialize("Test Token", "TEST", 18);
        console.log("token", address(token), token.name());
    }

    function testProvideLiquidity() public {
        token.mint(address(this), 1000);
        token.approve(address(router), 1000);
        (uint256 amountToken, uint256 amountETH, uint256 liquidity) = router.addLiquidityETH{value: 1 ether}(address(token), 1000, 0, 0, address(this), block.timestamp + 1);
        assertEq(amountToken, 1000);
        assertEq(amountETH, 1 ether);
        assertEq(liquidity, 31622775601);
    }
}
