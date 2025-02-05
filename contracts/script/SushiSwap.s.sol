// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.27;

import {Script, console} from "forge-std/Script.sol";
import {PumpRand} from "../src/pump/PumpRand.sol";
import { WETH9 } from "../src/dex/mocks/WETH9.sol";

contract PumpRandScript is Script {
    // PumpRand public pump;
    WETH9 public weth9;

    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        weth9 = new WETH9();
        // pump = new PumpRand(0);

        vm.stopBroadcast();
    }
}
