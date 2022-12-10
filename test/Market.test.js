
const { loadFixture } = require('@nomicfoundation/harhat-network-helpers');
const { expect } = require('chai');

describe('Contracts', () => {
    async function deployContractsFixture() {
        const HouseNFT = await ethers.getContractFactory('HouseNFT');
        let houseNFT = await HouseNFT.deploy();
        await houseNFT.deployed();

        const Market = await ethers.getContractFactory('Market');
        let market = await Market.deploy();
        await market.deployed();

        const [owner, addr1, addr2, addr3] = await ethers.getSigners();

        return { 
            houseNFT, 
            houseNFTAddress: houseNFT.address, 
            market, 
            marketAddress: market.address, 
            owner, 
            addr1, 
            addr2, 
            addr3 
        };
    }
});