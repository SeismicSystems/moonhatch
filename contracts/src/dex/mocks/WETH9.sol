// SPDX-License-Identifier: GPL-3.0-only

pragma solidity ^0.8.27;

import { ISRC20 } from "../../token/ISRC20.sol";

contract WETH9 is ISRC20 {
    string public name = "Wrapped Ether";
    string public symbol = "WETH";
    uint8 public decimals = 18;

    // event Approval(address indexed src, address indexed guy, uint256 wad);
    // event Transfer(address indexed src, address indexed dst, uint256 wad);
    // event Deposit(address indexed dst, uint256 wad);
    // event Withdrawal(address indexed src, uint256 wad);

    mapping(saddress => suint256) internal _balanceOf;
    mapping(saddress => mapping(saddress => suint256)) internal _allowance;

    /*fallback () external payable {
        deposit();
    }*/
    function deposit() public payable {
        _balanceOf[saddress(msg.sender)] = _balanceOf[saddress(msg.sender)] + suint256(msg.value);
        // emit Deposit(msg.sender, msg.value);
    }

    function withdraw(suint256 wad) public {
        require(_balanceOf[saddress(msg.sender)] >= wad, "WETH9: Error");
        _balanceOf[saddress(msg.sender)] -= wad;
        payable(msg.sender).transfer(uint256(wad));
        // emit Withdrawal(msg.sender, wad);
    }

    function totalSupply() public view returns (uint256) {
        return address(this).balance;
    }

    function approve(saddress guy, suint256 wad) public returns (bool) {
        _allowance[saddress(msg.sender)][guy] = wad;
        // emit Approval(msg.sender, guy, wad);
        return true;
    }

    function transfer(saddress dst, suint256 wad) public returns (bool) {
        return transferFrom(saddress(msg.sender), dst, wad);
    }

    function transferFrom(
        saddress src,
        saddress dst,
        suint256 wad
    ) public returns (bool) {
        require(_balanceOf[src] >= wad, "WETH9: Error");

        if (src != saddress(msg.sender) && _allowance[src][saddress(msg.sender)] != suint256(type(uint256).max)) {
            require(_allowance[src][saddress(msg.sender)] >= wad, "WETH9: Error");
            _allowance[src][saddress(msg.sender)] -= wad;
        }

        _balanceOf[src] -= wad;
        _balanceOf[dst] += wad;

        // emit Transfer(src, dst, wad);

        return true;
    }

    function balanceOf() external view returns (uint256) {
        return uint256(_balanceOf[saddress(msg.sender)]);
    }

    function allowance(saddress spender) external view returns (uint256) {
        return uint256(_allowance[saddress(msg.sender)][spender]);
    }
}
