// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.27;

import { ISRC20 } from "../token/ISRC20.sol";
import { SRC20 } from "../token/SRC20.sol";

/*//////////////////////////////////////////////////////////////
//                       IPumpCoin Interface
//////////////////////////////////////////////////////////////*/

// IPumpCoin extends ISRC20 by adding the mint function.
interface IPumpCoin is ISRC20 {
    function mint(saddress to, suint256 amount) external;
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
    function graduate() public onlyOwner {
        graduated = true;
    }

    /// @notice Mints new tokens to the specified address.
    function mint(saddress to, suint256 amount) public onlyOwner {
        _mint(to, amount);
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
}
