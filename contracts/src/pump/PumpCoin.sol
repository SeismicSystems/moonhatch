// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.27;

import { ISRC20 } from "../token/ISRC20.sol";
import { SRC20 } from "../token/SRC20.sol";
import { IERC20Uniswap } from "../dex/interfaces/IERC20.sol";

/*//////////////////////////////////////////////////////////////
//                       IPumpCoin Interface
//////////////////////////////////////////////////////////////*/
// IPumpCoin extends ISRC20 by adding the mint function.
interface IPumpCoin is ISRC20, IERC20Uniswap {
    function decimals() external view override(ISRC20, IERC20Uniswap) returns (uint8);
    function name() external view override(ISRC20, IERC20Uniswap) returns (string memory);
    function symbol() external view override(ISRC20, IERC20Uniswap) returns (string memory);
    function totalSupply() external view override(ISRC20, IERC20Uniswap) returns (uint256);
    function mint(saddress to, suint256 amount) external;
    function graduate() external;
}
/*//////////////////////////////////////////////////////////////
//                         PumpCoin Contract
//////////////////////////////////////////////////////////////*/

contract PumpCoin is SRC20, IPumpCoin {
    address public owner;
    bool public graduated;

    constructor(
        address _owner, 
        string memory _name, 
        string memory _symbol,
        uint8 _decimals
    ) SRC20(_name, _symbol, _decimals) {
        owner = _owner;
        graduated = false;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Must be owner");
        _;
    }

    modifier onlyGraduated() {
        require(graduated, "Must be graduated");
        _;
    }

    /// @notice Enable token transfers/queries after graduation.
    function graduate() external onlyOwner {
        graduated = true;
    }

    /// @notice Mints new tokens to the specified address.
    function mint(saddress to, suint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    function totalSupply() external view override(SRC20, IPumpCoin) returns (uint256) {
        return SRC20.totalSupply;
    }

    /// @notice Returns the balance of msg.sender.
    /// @dev Only available after graduation.
    function balanceOf() public view override(ISRC20, SRC20) onlyGraduated returns (uint256) {
        return SRC20.balanceOf();
    }

    /// @notice Transfers tokens to another address.
    /// @dev Only available after graduation.
    function transfer(saddress to, suint256 amount) public override(ISRC20, SRC20) onlyGraduated returns (bool) {
        return SRC20.transfer(to, amount);
    }

    /// @notice Transfers tokens from one address to another.
    /// @dev Only available after graduation.
    function transferFrom(saddress from, saddress to, suint256 amount) public override(ISRC20, SRC20) onlyGraduated returns (bool) {
        return SRC20.transferFrom(from, to, amount);
    }

    function balanceOf(address owner_) external view returns (uint) {
        return uint256(balance[saddress(owner_)]);
    }

    function allowance(address owner_, address spender) external view returns (uint) {
        return uint256(_allowance[saddress(owner_)][saddress(spender)]);
    }

    function approve(address spender, uint value) external returns (bool) {
        SRC20.approve(saddress(spender), suint256(value));
        return true;
    }

    function transfer(address to, uint value) external returns (bool) {
        return SRC20.transfer(saddress(to), suint256(value));
    }

    function transferFrom(address from, address to, uint value) external returns (bool) {
        return SRC20.transferFrom(saddress(from), saddress(to), suint256(value));
    }
}
