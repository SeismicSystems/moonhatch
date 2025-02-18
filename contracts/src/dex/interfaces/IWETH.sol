// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.5.0;

interface IWETH {
    function deposit() external payable;
    function transfer(saddress to, suint value) external returns (bool);
    function withdraw(uint) external;
}