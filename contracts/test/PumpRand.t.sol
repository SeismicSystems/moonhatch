// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.27;

import {Test, console} from "forge-std/Test.sol";
import { PumpRand, Coin } from "../src/pump/PumpRand.sol";
import { IPumpCoin } from "../src/pump/PumpCoin.sol";

contract PumpRandTest is Test {
    PumpRand public pump;
    uint256 balance;

    function setUp() public {
        pump = new PumpRand(0);
    }

    // so our contract can receive funds
    receive() external payable {}

    /// @dev This test creates a coin, performs several buys, and finally 
    /// checks that the coin is marked as graduated once the cumulative deposit 
    /// reaches (or exceeds) 1 ETH.
    function testCreateBuy() public {
        uint32 coinId = pump.createCoin("Bitcoin", "BTC", 21_000_000_000_000_000_000_000);
        assertEq(coinId, 0);

        // First buy with a small deposit. (Should not graduate yet.)
        pump.buy{value: 100 wei}(coinId);
        assertFalse(pump.isGraduated(coinId));
    
        // Second buy with 1 ETH deposit.
        pump.buy{value: 0.9 ether}(coinId);
        assertFalse(pump.isGraduated(coinId));

        uint256 refunded = pump.buy{value: 0.1 ether}(coinId);
        assertTrue(pump.isGraduated(coinId));
        assertEq(refunded, 100);
    }

    /// Once the coin has graduated, no further buys should be allowed.
    function testNoAdditionalBuysAfterGraduation() public {
        uint32 coinId = pump.createCoin("TestCoin", "TST", 21_000_000_000_000_000_000_000);
        
        // This buy should trigger graduation.
        pump.buy{value: 1 ether}(coinId);
        assertTrue(pump.isGraduated(coinId));

        // Attempting to buy more should revert.
        vm.expectRevert();
        pump.buy{value: 0.1 ether}(coinId);
    }

    // Several small buys that never sum to 1 ETH should not graduate.
    function testCumulativeSmallBuysNoGraduation() public {
        uint32 coinId = pump.createCoin("TestCoin", "TST", 21_000_000_000_000_000_000_000);
        uint256 refund1 = pump.buy{value: 0.2 ether}(coinId);
        assertEq(refund1, 0);
        assertFalse(pump.isGraduated(coinId));

        uint256 refund2 = pump.buy{value: 0.2 ether}(coinId);
        assertEq(refund2, 0);
        assertFalse(pump.isGraduated(coinId));

        uint256 refund3 = pump.buy{value: 0.2 ether}(coinId);
        assertEq(refund3, 0);
        // Total is 0.6 ETH, still below graduation.
        assertFalse(pump.isGraduated(coinId));
    }

    // A series of buys that sum exactly to 1 ETH should graduate with zero refund.
    function testGraduationWithExactDeposit() public {
        uint32 coinId = pump.createCoin("TestCoin", "TST", 21_000_000_000_000_000_000_000);
        uint256 refund1 = pump.buy{value: 0.4 ether}(coinId);
        assertEq(refund1, 0);
        assertFalse(pump.isGraduated(coinId));

        uint256 refund2 = pump.buy{value: 0.3 ether}(coinId);
        assertEq(refund2, 0);
        assertFalse(pump.isGraduated(coinId));

        uint256 refund3 = pump.buy{value: 0.3 ether}(coinId);
        // Exactly 1 ETH total, so no refund.
        assertEq(refund3, 0);
        assertTrue(pump.isGraduated(coinId));
    }

    // A buy that exceeds 1 ETH cumulatively should refund the extra ETH.
    function testGraduationWithExcessRefund() public {
        uint32 coinId = pump.createCoin("TestCoin", "TST", 21_000_000_000_000_000_000_000);
        uint256 refund1 = pump.buy{value: 0.8 ether}(coinId);
        assertEq(refund1, 0);
        assertFalse(pump.isGraduated(coinId));

        uint256 refund2 = pump.buy{value: 0.3 ether}(coinId);
        // With 0.8 ETH already deposited, requiredWei is 0.2 ETH so refund should be 0.1 ETH.
        assertEq(refund2, 0.1 ether);
        assertTrue(pump.isGraduated(coinId));
    }

    // Once the coin graduates, no further buys are allowed.
    function testNoBuyAfterGraduation() public {
        uint32 coinId = pump.createCoin("TestCoin", "TST", 21_000_000_000_000_000_000_000);
        uint256 refund1 = pump.buy{value: 1 ether}(coinId);
        assertTrue(pump.isGraduated(coinId));
        assertEq(refund1, 0);

        vm.expectRevert();
        pump.buy{value: 0.1 ether}(coinId);
    }

    // Test buying > 1eth worth gives auto refund of 0.1 eth 
    function testRefundBuysOver1Eth() public {
        uint32 coinId = pump.createCoin("TestCoin", "TST", 21_000_000_000_000_000_000_000);
        uint256 refund1 = pump.buy{value: 1.1 ether}(coinId);
        assertTrue(pump.isGraduated(coinId));
        assertEq(refund1, 0.1 ether);
    }

    // Multiple buyers: a second buyer's purchase that graduates the coin should refund their excess ETH.
    function testMultipleBuyersRefund() public {
        uint32 coinId = pump.createCoin("TestCoin", "TST", 21_000_000_000_000_000_000_000);
    
        vm.deal(address(0xDDDD), 10 ether);
        vm.deal(address(0xEEEE), 10 ether);
    
        vm.prank(address(0xDDDD));
        uint256 refundA = pump.buy{value: 0.5 ether}(coinId);
        assertEq(refundA, 0);
        assertFalse(pump.isGraduated(coinId));

        vm.prank(address(0xEEEE));
        uint256 refundB = pump.buy{value: 0.6 ether}(coinId);
        // With 0.5 ETH already deposited, buyer B only needs 0.5 ETH to reach 1 ETH.
        // Thus, buyer B should receive a refund of 0.1 ETH.
        assertEq(refundB, 0.1 ether);
        assertTrue(pump.isGraduated(coinId));
    }
}
