// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import { PumpCoin, IPumpCoin } from "./SRC20.sol";

struct Coin {
    string name;
    string symbol;
    uint256 supply;
    address contractAddress;
    // TODO: add decimals?
    // uint8 decimals;
}

contract PumpRand {
    // 1 eth to graduate
    uint256 public constant WEI_GRADUATION = 1_000_000_000_000_000_000;

    uint16 feeBps;
    uint32 public coinsCreated;
    address public deployer;
    uint256 private fees;

    // directory of all coins created
    mapping(uint32 => Coin) private coins;

    mapping(uint32 => bool) public graduated;
    mapping(uint32 => suint256) weisIn;
    mapping(uint32 => suint256) unitsOut;
    mapping(uint32 => mapping(saddress => suint256)) bondAmounts;

    event CoinCreated(Coin coin);
    event CoinGraduated(uint32 coinId);

    error NoCoinWithId(uint32 coinId);
    error RngPrecompileCallFailed();
    error SupplyTooLow();
    error CoinAlreadyGraduated();
    error CoinNotYetGraduated();
    error SweepFeesFailed();

    constructor(uint16 _feeBps) {
        deployer = msg.sender;
        coinsCreated = 0;
        feeBps = _feeBps;
    }

    function sweepFees() public payable {
        if (payable(deployer).send(fees)) {
            fees = 0;
        } else {
            revert SweepFeesFailed();
        }
    }

    function createCoin(string calldata name, string calldata symbol, uint256 supply) public returns(uint32 coinId) {
        if (supply < 100 * WEI_GRADUATION) {
            revert SupplyTooLow();
        }
        PumpCoin pc = new PumpCoin(address(this), name, symbol, 18);
        coinId = coinsCreated;
        coins[coinId] = Coin(name, symbol, supply, address(pc));
        weisIn[coinId] = suint256(0);
        unitsOut[coinId] = suint256(0);
        coinsCreated = coinsCreated + 1;
    }

    function getCoin(uint32 coinId) public view returns (Coin memory) {
        if (coinId >= coinsCreated) {
            revert NoCoinWithId(coinId);
        }
        return coins[coinId];
    }

    function getCoinContract(uint32 coinId) public view returns (IPumpCoin) {
        Coin memory coin = getCoin(coinId);
        IPumpCoin pc = IPumpCoin(coin.contractAddress);
        return pc;
    }

    function buy(uint32 coinId) public payable {
        if (graduated[coinId]) {
            revert CoinAlreadyGraduated();
        }
        Coin memory coin = getCoin(coinId);
        // TODO: add fees + LP amount
        suint256 price = randomUnitsPerWei(suint256(coin.supply) - unitsOut[coinId], weisIn[coinId]);
        suint256 tokensToBond = price * suint256(msg.value);
        suint256 remainingToBond = suint256(coin.supply) - unitsOut[coinId];
        uint256 excessFill = 0;
        if (tokensToBond >= remainingToBond) {
            excessFill = uint256(tokensToBond) - uint256(remainingToBond);
            tokensToBond = remainingToBond;
            emit CoinGraduated(coinId);
            graduated[coinId] = true;
        }

        IPumpCoin pc = IPumpCoin(coin.contractAddress);
        pc.mint(saddress(msg.sender), tokensToBond);
        if (excessFill > 0) {
            uint256 weiToRefund = excessFill / uint256(price);
            payable(msg.sender).transfer(weiToRefund);
        }
    }

    /**
    Fairness constraint:
    basePrice = coin.supply / WEI_GRADUATION
    EV[price] = basePrice without knowing any previous prices
    EV[price|allPreviousBuys] = (coin.supply - unitsOut) / (WEI_GRADUATION - weiIn)
    */
    function randomUnitsPerWei(suint256 supplyRemaining, suint256 weiIn) internal view returns (suint256) {
        suint256 basePrice = supplyRemaining / (suint256(WEI_GRADUATION) - weiIn);
        suint256 priceMult = getRandomUint256() / suint256(2**127);
        return basePrice * priceMult / suint256(2**128);
    }

    function getRandomUint256()
        internal
        view
        returns (suint256 result)
    {
        uint16 output_len = 32;
        bytes memory input = abi.encodePacked(output_len);

        (bool success, bytes memory output) = address(0x64).staticcall(input);
        if (!success) {
            // TODO:
            return suint256(type(uint256).max / 2);
            // revert RngPrecompileCallFailed();
        }

        assembly {
            result := mload(add(output, 32))
        }
    }

    function isGraduated(uint32 coinId) public view returns (bool) {
        return graduated[coinId];
    }

    function deployGraduated(uint32 coinId) public {
        // TODO: add to LP pool
    }
}
