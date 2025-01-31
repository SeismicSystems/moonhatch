// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import { PumpRand, Coin } from "../src/PumpRand.sol";
import { IPumpCoin } from "../src/SRC20.sol";

contract PumpRandTest is Test {
    PumpRand public pump;

    function setUp() public {
        pump = new PumpRand(0);
    }

    function test_create_buy() public {
        uint32 coinId = pump.createCoin("Bitcoin", "BTC", 21_000_000_000_000_000_000_000);
        assertEq(coinId, 0);

        Coin memory coin = pump.getCoin(coinId);
        console.log(coin.contractAddress);
        IPumpCoin pc = pump.getCoinContract(coinId);

        pump.buy{value: 100 wei}(coinId);
    }
}
