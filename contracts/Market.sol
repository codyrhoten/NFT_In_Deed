// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

import '@openzeppelin/contracts/utils/Counters.sol';
import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/security/ReentrancyGuard.sol';

contract Market is ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _housesSold;
    Counters.Counter private _houseCount;
}