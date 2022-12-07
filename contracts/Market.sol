// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

import '@openzeppelin/contracts/utils/Counters.sol';
import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/security/ReentrancyGuard.sol';

contract Market is ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _houseCount;
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
        uint256 houseId,
        address houseContract,
        address seller,
        address owner,
        uint256 price
    );

    event houseSold(
        uint256 houseId,
        address houseContract,
        address seller,
        address owner,
        uint256 price
    );

    constructor() {
        _marketOwner = payable(msg.sender);
    }

    function calculateListingFee(uint256 _price) private pure returns(uint256) {
        return (_price * 300) / 10_000;
    }

    // List the house on the market
    function listHouse(
        address _houseContract,
        uint256 _houseId,
        uint256 _price
    ) public payable nonReentrant {
        require(_price > 0, 'Price must be at least 1 wei');
        require(
            msg.value == calculateListingFee(_price), 
            'Not enough ether for listing fee'
        );

        IERC721(_houseContract)
            .transferFrom(msg.sender, address(this), _houseId);
        _houseCount.increment();

        idToHouse[_houseId] = house(
            _houseId, 
            _houseContract, 
            payable(msg.sender), 
            payable(address(this)), 
            _price, 
            true
        );

        emit houseListed(
            _houseId, 
            _houseContract, 
            msg.sender, 
            address(this), 
            _price
        );
    }

    // Buy a house: transfers ownership and funds between parties
    function buyHouse(
        address _houseContract,
        uint256 _houseId
    ) public payable nonReentrant {
        house storage _house = idToHouse[_houseId];
        require(
            msg.value >= _house.price, 
            'Not enough ether to afford asking price'
        );

        payable(_house.seller).transfer(msg.value);
        IERC721(_houseContract)
            .transferFrom(address(this), msg.sender, _houseId);
        _house.owner = payable(msg.sender);
        _house.listed = false;
        _marketOwner.transfer(calculateListingFee(_house.price));
        _houseCount.decrement();

        emit houseSold(
            _houseId, 
            _houseContract, 
            _house.seller, 
            msg.sender, 
            msg.value
        );
    }

    function getListedHouses() public view returns(house[] memory) {
        uint256 houseCount = _houseCount.current();
        uint256 currentIndex = 0;
    }
}