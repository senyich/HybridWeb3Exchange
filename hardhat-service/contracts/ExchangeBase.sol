// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ExchangeBase {
    mapping(address => uint256) public balances;
    event Deposit(
        address indexed user,
        uint256 amount
    );
    event Withdraw(
        address indexed user,
        uint256 amount
    );
    function deposit() external payable{
        require(msg.value > 0, "zero deposit");
        balances[msg.sender] += msg.value;
        emit Deposit(
            msg.sender,
            msg.value
        );
    }
    function withdraw(uint256 amount) external {
        require(balances[msg.sender] >= amount, "not enough balance");
        balances[msg.sender] -= amount;
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "transfer failed");
        emit Withdraw(
            msg.sender,
            amount
        );
    }
    function getBalance(address user) external view returns (uint256) {
        return balances[user];
    }
    function getContractTotalBalance() external view returns (uint256) {
        return address(this).balance;
    }
}