// SPDX-License-Identifier: GPL-3.0-only

pragma solidity ^0.8.27;

import { ISRC20 } from "../../token/ISRC20.sol";
import { IERC20Uniswap } from "../interfaces/IERC20.sol";
import { IWETH } from "../interfaces/IWETH.sol";

contract WETH9 is ISRC20, IERC20Uniswap, IWETH {
    string public override(ISRC20, IERC20Uniswap) name = "Wrapped Ether";
    string public override(ISRC20, IERC20Uniswap) symbol = "WETH";
    uint8 public override(ISRC20, IERC20Uniswap) decimals = 18;

    event Deposit(address indexed dst, uint256 wad);
    event Withdrawal(address indexed src, uint256 wad);

    mapping(address => uint256) internal _balanceOf;
    mapping(address => mapping(address => uint256)) internal _allowance;

    function deposit() public payable {
        _balanceOf[msg.sender] = _balanceOf[msg.sender] + msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    function withdraw(uint256 wad) public {
        require(_balanceOf[msg.sender] >= wad, "WETH9: Error");
        _balanceOf[msg.sender] -= wad;
        payable(msg.sender).transfer(wad);
        emit Withdrawal(msg.sender, wad);
    }

    function totalSupply() public view override(ISRC20, IERC20Uniswap) returns (uint256) {
        return address(this).balance;
    }

    function approve(address guy, uint256 wad) public returns (bool) {
        _allowance[msg.sender][guy] = wad;
        emit Approval(msg.sender, guy, wad);
        return true;
    }

    function approve(saddress spender, suint value) external returns (bool) {
        return approve(address(spender), uint256(value));
    }

    function transfer(saddress dst, suint256 wad) public returns (bool) {
        return _transferFrom(msg.sender, address(dst), uint256(wad));
    }

    function transfer(address to, uint value) external override(IWETH, IERC20Uniswap) returns (bool) {
        return _transferFrom(msg.sender, to, value);
    }

    function _transferFrom(address from, address to, uint value) internal returns (bool) {
        require(_balanceOf[from] >= value, "WETH9: Error");

        if (from != msg.sender && _allowance[from][msg.sender] != type(uint256).max) {
            require(_allowance[from][msg.sender] >= value, "WETH9: Error");
            _allowance[from][msg.sender] -= value;
        }

        _balanceOf[from] -= value;
        _balanceOf[to] += value;

        emit Transfer(from, to, value);

        return true;
    }

    function transferFrom(
        saddress from,
        saddress to,
        suint256 value
    ) public returns (bool) {
        return _transferFrom(address(from), address(to), uint256(value));
    }

    function transferFrom(
        address from,
        address to,
        uint256 value
    ) public returns (bool) {
        return _transferFrom(address(from), address(to), uint256(value));
    }

    function balanceOf() external view returns (uint256) {
        return uint256(_balanceOf[msg.sender]);
    }

    function balanceOf(address owner) external view returns (uint) {
        return uint(_balanceOf[owner]);
    }

    function allowance(address owner, address spender) external view returns (uint) {
        return uint256(_allowance[owner][spender]);
    }

    function allowance(saddress spender) external view returns (uint256) {
        return uint256(_allowance[msg.sender][address(spender)]);
    }
}
