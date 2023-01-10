// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Market is ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private houseCount;
    Counters.Counter private housesSold;
    address payable private marketOwner;

    struct House {
        uint256 houseId;
        address houseContract;
        address payable seller;
        address payable owner;
        uint256 price;
        bool listed;
    }

    mapping(uint256 => House) private idToHouse;

    event HouseListed(
        uint256 houseId,
        address houseContract,
        address seller,
        address owner,
        uint256 price,
        bool listed
    );

    event HouseSold(
        uint256 houseId,
        address houseContract,
        address seller,
        address owner,
        uint256 price,
        bool listed
    );

    modifier onlyMarketOwner() {
        require(
            msg.sender == marketOwner, 
            'Only the market owner can perform this action'
        );
        _;
    }

    constructor() {
        marketOwner = payable(msg.sender);
    }

    function getListingFee(uint256 _price) public pure returns (uint256) {
        uint256 fee = (_price * 300) / 10_000;
        return fee;
    }

    function getMarketOwner() external view onlyMarketOwner returns (address) {
        return marketOwner;
    }

    function getMarketOwnerBalance() external view onlyMarketOwner returns (uint256) {
        return marketOwner.balance;
    }

    // List the house on the market
    function listHouse(
        address _houseContract,
        uint256 _houseId,
        uint256 _price
    ) 
        public 
        payable 
        nonReentrant 
    {
        require(_price > 0, "Price must be at least 1 wei");
        require(
            msg.value == getListingFee(_price),
            "Not enough ether for listing fee"
        );

        IERC721(_houseContract).transferFrom(
            msg.sender,
            address(this),
            _houseId
        );

        houseCount.increment();

        idToHouse[_houseId] = House(
            _houseId,
            _houseContract,
            payable(msg.sender),
            payable(address(this)),
            _price,
            true
        );

        emit HouseListed(
            _houseId,
            _houseContract,
            msg.sender,
            address(this),
            _price,
            true
        );
    }

    // Buy a house: transfers ownership and funds between parties
    function buyHouse(address _houseContract, uint256 _houseId)
        public
        payable
        nonReentrant
    {
        House storage _house = idToHouse[_houseId];
        uint256 listingFee = getListingFee(_house.price);
        require(
            msg.value == _house.price,
            "Please submit the correct price"
        );
        payable(_house.seller).transfer(msg.value);
        IERC721(_houseContract).transferFrom(
            address(this),
            msg.sender,
            _houseId
        );
        _house.owner = payable(msg.sender);
        _house.listed = false;
        payable(marketOwner).transfer(listingFee);
        housesSold.increment();

        emit HouseSold(
            _houseId,
            _houseContract,
            _house.seller,
            msg.sender,
            msg.value,
            false
        );
    }

    function getListedHouses() public view returns (House[] memory) {
        uint256 _houseCount = houseCount.current();
        uint256 listedHouses = _houseCount - housesSold.current();
        House[] memory houses = new House[](listedHouses);

        for (uint256 i = 0; i < _houseCount; i++) {
            if (idToHouse[i + 1].listed) {
                houses[i] = idToHouse[i + 1];
            }
        }

        return houses;
    }

    function getMyHouses() public view returns (House[] memory) {
        uint256 _houseCount = houseCount.current();
        uint256 myHouseCount = 0;

        for (uint256 i = 0; i < _houseCount; i++) {
            if (idToHouse[i + 1].owner == msg.sender) {
                myHouseCount++;
            }
        }

        House[] memory myHouses = new House[](myHouseCount);

        for (uint256 i = 0; i < _houseCount; i++) {
            if (idToHouse[i + 1].owner == msg.sender) {
                myHouses[i] =  idToHouse[i + 1];
            }
        }

        return myHouses;
    }

    function getMyListedHouses() public view returns (House[] memory) {
        uint256 _houseCount = houseCount.current();
        uint256 myListedHouseCount = 0;

        for (uint256 i = 0; i < _houseCount; i++) {
            if (idToHouse[i + 1].seller == msg.sender && idToHouse[i + 1].listed) {
                myListedHouseCount++;
            }
        }

        House[] memory myListedHouses = new House[](myListedHouseCount);

        for (uint256 i = 0; i < _houseCount; i++) {
            if (idToHouse[i + 1].seller == msg.sender && idToHouse[i + 1].listed) {
                myListedHouses[i] = idToHouse[i + 1];
            }
        }

        return myListedHouses;
    }
}
