// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol';
import '@openzeppelin/contracts/utils/Counters.sol';

contract HouseNFT is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _houseIds;
    address marketContract;
    event HouseMinted(uint256);

    constructor(address _marketContract) ERC721('NFT In Deed', 'NID') {
        marketContract = _marketContract;
    }

    function mint(string memory _houseURI) public {
        _houseIds.increment();
        uint256 newHouseId = _houseIds.current();
        _safeMint(msg.sender, newHouseId);
        _setTokenURI(newHouseId, _houseURI);
        setApprovalForAll(marketContract, true);
        emit HouseMinted(newHouseId);
    }
}