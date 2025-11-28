# 🧮 ChangeCalculator – Simple Solidity Change-Return Smart Contract

A beginner-friendly Ethereum smart contract that accepts a payment, compares it with the set item price, and **automatically returns extra change** to the buyer.  
The contract owner can set the item price anytime and withdraw collected funds.

---

## 📌 Project Description

ChangeCalculator is a simple, safe smart contract designed for learning Solidity basics while building something practical.  
It handles **Ether payments**, **refunds extra change**, and **lets the owner withdraw funds**.

The contract includes:
- No constructor inputs (easy deployment)
- A basic **reentrancy guard**
- Owner-only functions  
- Clean event logging

Perfect for beginners exploring Solidity, smart contract logic, and ETH transfers.

---

## 🚀 What It Does

1. **Owner sets an item price** (in wei).  
2. **Buyer sends ETH** using `pay()`.  
3. If the buyer sends **more** than the price, the contract **automatically refunds** the difference.  
4. The contract keeps exactly the price amount.  
5. Owner can later **withdraw accumulated funds** safely.

This behaviour mimics a real-world "change calculator"—just on-chain.

---

## ⭐ Features

### ✔️ Easy Deployment  
No constructor parameters—deploy instantly on any EVM chain.

### ✔️ Automatic Change Refund  
If a buyer overpays, extra ETH is returned immediately.

### ✔️ Owner-Controlled Pricing  
The contract owner can update the item price anytime.

### ✔️ Secure Withdrawals  
Funds can be withdrawn only by the owner, protected by a simple reentrancy guard.

### ✔️ Events for Transparency  
- `PriceUpdated`
- `Paid`
- `Withdraw`

### ✔️ Beginner-Friendly Code  
Commented code, clean structure, and safe patterns.

---

## 🔗 Deployed Smart Contract

**Network:** (XXX — replace with your network name)  
**Contract Address:**  
# 🧮 ChangeCalculator – Simple Solidity Change-Return Smart Contract

A beginner-friendly Ethereum smart contract that accepts a payment, compares it with the set item price, and **automatically returns extra change** to the buyer.  
The contract owner can set the item price anytime and withdraw collected funds.

---

## 📌 Project Description

ChangeCalculator is a simple, safe smart contract designed for learning Solidity basics while building something practical.  
It handles **Ether payments**, **refunds extra change**, and **lets the owner withdraw funds**.

The contract includes:
- No constructor inputs (easy deployment)
- A basic **reentrancy guard**
- Owner-only functions  
- Clean event logging

Perfect for beginners exploring Solidity, smart contract logic, and ETH transfers.

---

## 🚀 What It Does

1. **Owner sets an item price** (in wei).  
2. **Buyer sends ETH** using `pay()`.  
3. If the buyer sends **more** than the price, the contract **automatically refunds** the difference.  
4. The contract keeps exactly the price amount.  
5. Owner can later **withdraw accumulated funds** safely.

This behaviour mimics a real-world "change calculator"—just on-chain.

---

## ⭐ Features

### ✔️ Easy Deployment  
No constructor parameters—deploy instantly on any EVM chain.

### ✔️ Automatic Change Refund  
If a buyer overpays, extra ETH is returned immediately.

### ✔️ Owner-Controlled Pricing  
The contract owner can update the item price anytime.

### ✔️ Secure Withdrawals  
Funds can be withdrawn only by the owner, protected by a simple reentrancy guard.

### ✔️ Events for Transparency  
- `PriceUpdated`
- `Paid`
- `Withdraw`

### ✔️ Beginner-Friendly Code  
Commented code, clean structure, and safe patterns.

---

## 🔗 Deployed Smart Contract

**Network:** (XXX — replace with your network name)  
**Contract Address:**  
https://coston2-explorer.flare.network/tx/0x5573fc593eec6746c5530c2039c6d394c2cb28bb17642bb776cf419c8cbd1e77

---

## 📂 Smart Contract Code

Paste your actual contract here:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/// @title ChangeCalculator - simple beginner contract to accept payment and return change
/// @author
/// @notice Deploy without inputs. Owner sets item price later. Buyers call pay() and get change refunded.
contract ChangeCalculator {
    address public owner;
    uint256 public price; // item price in wei

    // Simple reentrancy guard
    bool private locked;

    event PriceUpdated(uint256 oldPrice, uint256 newPrice);
    event Paid(address indexed buyer, uint256 amountPaid, uint256 price, uint256 change);
    event Withdraw(address indexed owner, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "only owner");
        _;
    }

    modifier noReentrant() {
        require(!locked, "reentrant");
        locked = true;
        _;
        locked = false;
    }

    /// @dev Deploy with no inputs
    constructor() {
        owner = msg.sender;
        price = 0; // default price 0 (owner should set price using setPrice)
    }

    /// @notice Owner sets the price (in wei)
    /// @param _price Price of the item in wei
    function setPrice(uint256 _price) external onlyOwner {
        emit PriceUpdated(price, _price);
        price = _price;
    }

    /// @notice Buyer pays the contract. If overpaid, the difference is refunded automatically.
    /// @return change The refunded amount (in wei)
    function pay() external payable noReentrant returns (uint256 change) {
        require(price > 0, "price not set");
        require(msg.value >= price, "insufficient payment");

        uint256 paid = msg.value;
        change = paid - price;

        // Refund change if any (send back to buyer)
        if (change > 0) {
            (bool sent, ) = payable(msg.sender).call{value: change}("");
            require(sent, "refund failed");
        }

        // The contract keeps `price` Wei for the owner to withdraw later
        emit Paid(msg.sender, paid, price, change);
        return change;
    }

    /// @notice Owner withdraws accumulated funds (the payments minus refunded change)
    function withdraw() external onlyOwner noReentrant {
        uint256 bal = address(this).balance;
        require(bal > 0, "no funds");
        (bool sent, ) = payable(owner).call{value: bal}("");
        require(sent, "withdraw failed");
        emit Withdraw(owner, bal);
    }

    /// @notice Helper view returning the current price (in wei)
    function getPrice() external view returns (uint256) {
        return price;
    }

    // Allow contract to receive plain ETH (not recommended for this use-case, but harmless)
    receive() external payable {}

    fallback() external payable {}
}


---



