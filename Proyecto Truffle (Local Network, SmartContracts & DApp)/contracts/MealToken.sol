// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MealToken is ERC20, Ownable {
    mapping(address => bool) private _admins; 

    constructor(uint256 totalSupply) ERC20("Meals", "MEAL") {
        _mint(msg.sender, totalSupply);
        _admins[msg.sender] = true;
    }

    modifier onlyAdmin() {
        require(isAdmin(msg.sender), "Only admins can call this function");
        _;
    }

    function isAdmin(address account) public view returns (bool) {
        return _admins[account];
    }

    function addAdmin(address newAdmin) public onlyOwner {
        require(!isAdmin(newAdmin), "Address is already an admin");
        _admins[newAdmin] = true;
    }

    function removeAdmin(address adminToRemove) public onlyOwner {
        require(isAdmin(adminToRemove), "Address is not an admin");
        _admins[adminToRemove] = false;
    }

    function mint(address account, uint256 amount) public onlyAdmin {
        _mint(account, amount);
    }

    function burn(address account, uint256 amount) public onlyAdmin {
        _burn(account, amount);
    }
}



