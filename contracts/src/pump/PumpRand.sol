// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.27;

import { PumpCoin, IPumpCoin } from "./PumpCoin.sol";
import '../dex/interfaces/IUniswapV2Router02.sol';
import '../dex/interfaces/IUniswapV2Factory.sol';

struct Coin {
    string name;
    string symbol;
    uint256 supply;
    address contractAddress;
    address creator;    
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
    // sushiswap contract
    address public dex;

    // directory of all coins created
    mapping(uint32 => Coin) private coins;

    mapping(uint32 => bool) public graduated;
    mapping(uint32 => suint256) weisIn;
    mapping(uint32 => suint256) unitsOut;
    mapping(uint32 => mapping(saddress => suint256)) weisInByAddress;

    event CoinCreated(uint32 coinId);
    event CoinGraduated(uint32 coinId);

    error NoCoinWithId(uint32 coinId);
    error RngPrecompileCallFailed();
    error SupplyTooLow();
    error CoinAlreadyGraduated();
    error CoinNotYetGraduated();
    error SweepFeesFailed();
    error FailedToRefundExcessEth();

    constructor(uint16 feeBps_, address dex_) {
        deployer = msg.sender;
        coinsCreated = 0;
        feeBps = feeBps_;
        dex = dex_;
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
        coins[coinId] = Coin(name, symbol, supply, address(pc),msg.sender);
        weisIn[coinId] = suint256(0);
        unitsOut[coinId] = suint256(0);
        emit CoinCreated(coinId);
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

    function getCoinData(uint32 coinId) external view returns (Coin memory coin, bool graduatedStatus) {
    coin = getCoin(coinId);
    graduatedStatus = graduated[coinId];
    }

    /**
    Fairness constraint:
    basePrice = coin.supply / WEI_GRADUATION
    EV[price] = basePrice without knowing any previous prices
    EV[price|allPreviousBuys] = (coin.supply - unitsOut) / (WEI_GRADUATION - weiIn)
    */
    function randomInRange(uint256 min, uint256 max) internal pure returns (uint256) {
        uint256 diff = max - min;
        // Shift down r to avoid overflow.
        uint256 r = uint256(getRandomUint256()) >> 128;
        uint256 denominatorShifted = type(uint256).max >> 128;
        uint256 scaled = (diff * r) / denominatorShifted;
        return min + scaled;
    }

    function buy(uint32 coinId) public payable returns (uint256 weiRefunded) {
        if (graduated[coinId]) revert CoinAlreadyGraduated();
        Coin memory coin = getCoin(coinId);
        uint256 W_prev = uint256(weisIn[coinId]);
        uint256 W_new = msg.value;
        uint256 totalWei = W_prev + W_new;
        uint256 T_rem = coin.supply - uint256(unitsOut[coinId]);
        uint256 R = WEI_GRADUATION - W_prev; // remaining wei until 1 ETH

        uint256 tokensMinted;
        IPumpCoin pc = IPumpCoin(coin.contractAddress);
    
        // Final deposit: if total wei deposited reaches or exceeds 1 ETH.
        if (totalWei >= WEI_GRADUATION) {
            uint256 requiredWei = WEI_GRADUATION - W_prev;
            uint256 refund = W_new - requiredWei;
            tokensMinted = T_rem;
            weisIn[coinId] = suint256(W_prev + requiredWei);
            weisInByAddress[coinId][saddress(msg.sender)] = weisInByAddress[coinId][saddress(msg.sender)] + suint256(requiredWei);
            unitsOut[coinId] = suint256(coin.supply);
            graduated[coinId] = true;
            pc.mint(saddress(msg.sender), suint256(tokensMinted));
            if (refund > 0) {
                bool success1 = payable(msg.sender).send(refund);
                if (!success1) {
                    revert FailedToRefundExcessEth();
                }
            }
            return refund;
        }

        // basePrice = T_rem / R, in fixed point (18 decimals).
        uint256 basePriceFP = (T_rem * 1e18) / R;
        uint256 M; // multiplier in fixed point (1e18 means 1×)

        // If the deposit is small enough (W_prev + 2*W_new < 1 ETH) then use full range [0,2e18].
        if (W_prev + 2 * W_new < WEI_GRADUATION) {
            M = randomInRange(0, 2e18);
        } else {
            // Adjusted randomness: restrict the range so that the worst-case outcome
            // gives exactly T_rem tokens and the expected multiplier remains 1.
            uint256 raw = (R * 1e18) / W_new; // raw = R/newWei (18-decimal fixed point)
            uint256 lowerBound = raw < 1e18 ? raw : (2e18 - raw);
            uint256 upperBound = raw < 1e18 ? (2e18 - raw) : raw;
            M = randomInRange(lowerBound, upperBound);
        }
        // price = basePriceFP * M / 1e18 (in tokens per wei, fixed point).
        uint256 priceFP = (basePriceFP * M) / 1e18;
        tokensMinted = (priceFP * W_new) / 1e18;

        weisIn[coinId] = suint256(W_prev + W_new);
        weisInByAddress[coinId][saddress(msg.sender)] = weisInByAddress[coinId][saddress(msg.sender)] + suint256(W_new);
        unitsOut[coinId] = suint256((coin.supply - T_rem) + tokensMinted);
        pc.mint(saddress(msg.sender), suint256(tokensMinted));
        return 0;
    }

    function getRandomUint256()
        internal
        pure
        returns (suint256 result)
    {
        // TODO: change pure => view
        return suint256(type(uint256).max / 2);
        // uint16 output_len = 32;
        // bytes memory input = abi.encodePacked(output_len);

        // (bool success, bytes memory output) = address(0x64).staticcall(input);
        // if (!success) {
        //     // TODO:
        //     return suint256(type(uint256).max / 2);
        //     // revert RngPrecompileCallFailed();
        // }

        // assembly {
        //     result := mload(add(output, 32))
        // }
    }

    function getWeiIn(uint32 coinId) public view returns (uint256) {
        return uint256(weisInByAddress[coinId][saddress(msg.sender)]);
    }

    function isGraduated(uint32 coinId) public view returns (bool) {
        return graduated[coinId];
    }

    function getCoinAddress(uint32 coinId) public view returns (address) {
        return coins[coinId].contractAddress;
    }

    function deployGraduated(uint32 coinId) public {
        IUniswapV2Router02 router = IUniswapV2Router02(dex);
        
        address token = getCoinAddress(coinId);
        IPumpCoin coin = IPumpCoin(token);

        // so it goes to pool with same price as average px was before
        // no one wins in EV
        uint256 coinAmountIn = coin.totalSupply();
        coin.mint(saddress(this), suint256(coinAmountIn));
        coin.approve(saddress(router), suint256(coinAmountIn));
        coin.graduate();

        router.addLiquidityETH{value: WEI_GRADUATION}(
            token,
            coinAmountIn,
            coinAmountIn,
            WEI_GRADUATION,
            // burn all
            0x000000000000000000000000000000000000dEaD,
            block.timestamp + 1
        );
    }

    function getPair(uint32 coinId) public view returns(address) {
        IUniswapV2Router02 router = IUniswapV2Router02(dex);
        return IUniswapV2Factory(router.factory()).getPair(coins[coinId].contractAddress, router.WETH());
    }
}
