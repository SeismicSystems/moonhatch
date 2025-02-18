// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.27;

import { IPumpCoin } from "../token/IPumpCoin.sol";

contract PumpCoin is IPumpCoin {
    address public owner;
    string public name_;
    string public symbol_;
    uint8 public immutable decimals_;
    bool public graduated;

    uint256 public totalSupply_;
    mapping(saddress => suint256) internal balance;
    mapping(saddress => mapping(saddress => suint256)) internal _allowance;

    constructor(
        address _owner, 
        string memory _name, 
        string memory _symbol,
        uint8 _decimals
    ) {
        owner = _owner;
        name_ = _name;
        symbol_ = _symbol;
        decimals_ = _decimals;
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

    modifier onlyUngraduated() {
        require(!graduated, "Must not be graduated");
        _;
    }

    modifier onlyOwnerUntilGraduated() {
        require(graduated || msg.sender == owner, "Only contract owner can call this before graduation");
        _;
    }
    
    /// @notice Enable token transfers/queries after graduation.
    function graduate() external onlyOwner {
        graduated = true;
    }

    function name() public view returns (string memory) {
        return name_;
    }

    function symbol() public view returns (string memory) {
        return symbol_;
    }

    function decimals() public view returns (uint8) {
        return decimals_;
    }
    
    function totalSupply() external view returns (uint256) {
        return totalSupply_;
    }

    /// @dev Only available after graduation
    function balanceOf() public onlyGraduated() view virtual returns (uint256) {
        return uint256(balance[saddress(msg.sender)]);
    }

    /// @dev Only available after graduation
    function balanceOf(address owner_) external onlyGraduated() view returns (uint) {
        return uint256(balance[saddress(owner_)]);
    }

    /// @dev Only owner can transfer before graduation
    function transfer(
        saddress to,
        suint256 amount
    ) public onlyOwnerUntilGraduated() virtual returns (bool) {
        // msg.sender is public information, casting to saddress below doesn't change this
        balance[saddress(msg.sender)] -= amount;
        unchecked {
            balance[to] += amount;
        }
        emit Transfer(msg.sender, address(to), uint256(amount));
        return true;
    }

    /// @dev Only owner can transfer before graduation
    function transfer(address to, uint value) external returns (bool) {
        return transfer(saddress(to), suint256(value));
    }

    /// @dev Only owner can transfer before graduation
    function transferFrom(
        saddress from,
        saddress to,
        suint256 amount
    ) public onlyOwnerUntilGraduated() virtual returns (bool) {
        suint256 allowed = _allowance[from][saddress(msg.sender)]; // Saves gas for limited approvals.
        if (allowed != suint256(type(uint256).max))
            _allowance[from][saddress(msg.sender)] = allowed - amount;

        balance[from] -= amount;
        unchecked {
            balance[to] += amount;
        }
        emit Transfer(address(from), address(to), uint256(amount));
        return true;
    }

    /// @dev Only owner can transfer before graduation
    function transferFrom(address from, address to, uint value) external returns (bool) {
        return transferFrom(saddress(from), saddress(to), suint256(value));
    }

    function allowance(saddress spender) external view returns (uint256) {
        return uint256(_allowance[saddress(msg.sender)][spender]);
    }

    function allowance(address owner_, address spender) external view returns (uint) {
        return uint256(_allowance[saddress(owner_)][saddress(spender)]);
    }

    function _approve(
        saddress spender,
        suint256 amount
    ) public virtual returns (bool) {
        _allowance[saddress(msg.sender)][spender] = amount;
        return true;
    }

    function approve(
        saddress spender,
        suint256 amount
    ) public virtual returns (bool) {
        _approve(spender, amount);
        emit Approval(msg.sender, address(spender), uint(amount));
        return true;
    }

    function approve(address spender, uint value) external returns (bool) {
        _approve(saddress(spender), suint256(value));
        emit Approval(address(msg.sender), spender, value);
        return true;
    }

    function _mint(saddress to, suint256 amount) internal onlyUngraduated() virtual {
        totalSupply_ += uint256(amount);
        unchecked {
            balance[to] += amount;
        }
    }

    function mint(saddress to, suint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}
