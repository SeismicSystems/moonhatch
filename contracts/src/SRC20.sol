/*
 * SPDX-License-Identifier: AGPL-3.0-only
 *
 * The Seismic version of ERC20. Recipient and amount of each transfer are only
 * known to the two parties involved.
 *
 * Fork of: https://github.com/transmissions11/solmate/blob/main/src/tokens/ERC20.sol
 *
 * [NOT FOR PRODUCTION USE]
 *
 */
pragma solidity ^0.8.13;

abstract contract SRC20 {
    /*//////////////////////////////////////////////////////////////
                                 EVENTS
    //////////////////////////////////////////////////////////////*/

    // Leaks information to public, will replace with encrypted events
    event Transfer(address indexed from, address indexed to, uint256 amount);
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 amount
    );

    /*//////////////////////////////////////////////////////////////
                            METADATA STORAGE
    //////////////////////////////////////////////////////////////*/

    string public name;

    string public symbol;

    uint8 public immutable decimals;

    /*//////////////////////////////////////////////////////////////
                              ERC20 STORAGE
    //////////////////////////////////////////////////////////////*/

    // All storage variables that will be mutated must be confidential to
    // preserve functional privacy.
    suint256 internal totalSupply;

    mapping(saddress => suint256) internal balance;

    mapping(saddress => mapping(saddress => suint256)) internal allowance;

    /*//////////////////////////////////////////////////////////////
                               CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    constructor(string memory _name, string memory _symbol, uint8 _decimals) {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
    }

    /*//////////////////////////////////////////////////////////////
                               ERC20 LOGIC
    //////////////////////////////////////////////////////////////*/

    function balanceOf() public view virtual returns (uint256) {
        return uint256(balance[saddress(msg.sender)]);
    }

    function approve(
        saddress spender,
        suint256 amount
    ) public virtual returns (bool) {
        allowance[saddress(msg.sender)][spender] = amount;

        emit Approval(msg.sender, address(spender), uint256(amount));

        return true;
    }

    function transfer(
        saddress to,
        suint256 amount
    ) public virtual returns (bool) {
        // msg.sender is public information, casting to saddress below doesn't
        // change this
        balance[saddress(msg.sender)] -= amount;

        // Cannot overflow because the sum of all user
        // balances can't exceed the max uint256 value.
        unchecked {
            balance[to] += amount;
        }

        emit Transfer(msg.sender, address(to), uint256(amount));

        return true;
    }

    function transferFrom(
        saddress from,
        saddress to,
        suint256 amount
    ) public virtual returns (bool) {
        suint256 allowed = allowance[from][saddress(msg.sender)]; // Saves gas for limited approvals.

        if (allowed != suint256(type(uint256).max))
            allowance[from][saddress(msg.sender)] = allowed - amount;

        balance[from] -= amount;

        // Cannot overflow because the sum of all user
        // balances can't exceed the max uint256 value.
        unchecked {
            balance[to] += amount;
        }

        emit Transfer(msg.sender, address(to), uint256(amount));

        return true;
    }

    /*//////////////////////////////////////////////////////////////
                        INTERNAL MINT/BURN LOGIC
    //////////////////////////////////////////////////////////////*/

    function _mint(address to, suint256 amount) internal virtual {
        totalSupply += amount;

        // Cannot overflow because the sum of all user
        // balances can't exceed the max uint256 value.
        unchecked {
            balance[saddress(to)] += amount;
        }

        emit Transfer(address(0), address(to), uint256(amount));
    }

    function _burn(address from, suint256 amount) internal virtual {
        balance[saddress(from)] -= amount;

        // Cannot underflow because a user's balance
        // will never be larger than the total supply.
        unchecked {
            totalSupply -= amount;
        }

        emit Transfer(address(from), address(0), uint256(amount));
    }
}

contract PumpCoin is SRC20 {
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

    function graduate() public onlyOwner {
        graduated = true;
    }

    function mint(address to, suint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    function balanceOf() public onlyGraduated view override returns (uint256) {
        return super.balanceOf();
    }

    function transfer(saddress to, suint256 amount) public onlyGraduated override returns (bool) {
        return super.transfer(to, amount);
    }

    function transferFrom(saddress from, saddress to, suint256 amount) public onlyGraduated override returns (bool) {
        return super.transferFrom(from, to, amount);
    }

    modifier onlyOwner() {
        // TODO: figure this out
        require(msg.sender == owner);
        _;
    }

    modifier onlyGraduated() {
        require(graduated);
        _;
    }
}

interface IPumpCoin {
    event Transfer(address indexed from, address indexed to, uint256 amount);
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 amount
    );

    function owner() external view returns (address);
    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
    function decimals() external view returns (uint8);
    function balanceOf() external view returns (uint256);
    function approve(
        saddress spender,
        suint256 amount
    ) external returns (bool);
    function transfer(
        saddress to,
        suint256 amount
    ) external returns (bool);
    function transferFrom(
        saddress from,
        saddress to,
        suint256 amount
    ) external returns (bool);
    function mint(saddress to, suint256 amount) external;
}
