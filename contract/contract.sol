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
