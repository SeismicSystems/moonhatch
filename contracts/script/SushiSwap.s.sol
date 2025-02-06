// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.27;

import {Script, console} from "forge-std/Script.sol";
import {PumpRand} from "../src/pump/PumpRand.sol";
import { WETH9 } from "../src/dex/mocks/WETH9.sol";
import { UniswapV2Factory } from "../src/dex/UniswapV2Factory.sol";
import { UniswapV2Router02 } from "../src/dex/UniswapV2Router02.sol";

contract SushiSwapScript is Script {
    // PumpRand public pump;
    WETH9 public weth9;
    UniswapV2Factory public factory;
    UniswapV2Router02 public router;

    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address deployerPublicKey = vm.addr(deployerPrivateKey);
        vm.startBroadcast(deployerPrivateKey);

        weth9 = new WETH9();
        factory = new UniswapV2Factory(deployerPublicKey);
        router = new UniswapV2Router02(address(weth9), address(factory));

        vm.stopBroadcast();
    }
}
