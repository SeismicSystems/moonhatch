// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {PumpRand} from "../src/PumpRand.sol";

contract PumpRandScript is Script {
    PumpRand public pump;

    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        pump = new PumpRand(0);

        vm.stopBroadcast();
    }
}
