// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

import '@openzeppelin/contracts/utils/Counters.sol';
import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/security/ReentrancyGuard.sol';
import '@openzeppelin/contracts/math/SafeMath.sol';

contract Market is ReentrancyGuard {
    using Counters for Counters.Counter;
    using SafeMath for uint256;
    Counters.Counter private _housesSold;
    Counters.Counter private _houseCount;
    // uint256 public LISTING_FEE = ? ether
    address payable private _marketOwner;

    struct house {
        uint256 houseId;
        address houseContract;
        address payable seller;
        address payable owner;
        uint256 price;
        bool listed;
    }

    mapping(uint256 => house) private idToHouse;

    event houseListed(
        address houseContract,
        uint256 houseId,
        address seller,
        address owner,
        uint256 price
    );

    event houseSold(
        address houseContract,
        uint256 houseId,
        address seller,
        address owner,
        uint256 price
    );

    function calculateListingFee(uint256 _price) external returns(uint256) {
        return mul(_price, 0.03);
    }
}