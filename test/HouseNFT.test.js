const { ethers } = require("hardhat");
const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');

describe('House NFT Contract', () => {
    async function deployContractsFixture() {
        const Market = await ethers.getContractFactory('Market');
        let market = await Market.deploy();
        await market.deployed();
        const marketAddress = market.address;

        const HouseNFT = await ethers.getContractFactory('HouseNFT');
        let houseNFT = await HouseNFT.deploy(marketAddress);
        await houseNFT.deployed();

        const [owner, addr1, addr2] = await ethers.getSigners();

        return {
            houseNFT,
            houseNFTAddress: houseNFT.address,
            market,
            marketAddress,
            owner,
            addr1,
            addr2,
        };
    }

    describe('Deployment', () => {
        it('Should set the Market contract\'s address', async function () {
            const {
                houseNFT,
                marketAddress,
            } = await loadFixture(deployContractsFixture);
            expect(await houseNFT.marketContract()).to.equal(marketAddress);
        });
    });
});