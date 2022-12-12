const { ethers } = require("hardhat");
const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');

describe('Market Contract', () => {
    async function deployContractsFixture() {
        const Market = await ethers.getContractFactory('Market');
        let market = await Market.deploy();
        await market.deployed();
        const marketAddress = market.address;

        const HouseNFT = await ethers.getContractFactory('HouseNFT');
        let houseNFT = await HouseNFT.deploy(marketAddress);
        await houseNFT.deployed();

        const [owner, addr1, addr2, addr3] = await ethers.getSigners();

        return {
            houseNFT,
            houseNFTAddress: houseNFT.address,
            market,
            marketAddress,
            owner,
            addr1,
            addr2,
            addr3
        };
    }

    describe('Deployment', () => {
        it('Should set the right owner', async function () {
            const { market, owner } = await loadFixture(deployContractsFixture);
            expect(await market.getMarketOwner()).to.equal(owner.address);
        });

        it(
            'Should get the listing fee at 3% of the price', 
            async function () {
                const { market } = await loadFixture(deployContractsFixture);
                const price = '115';
                let contractListingFee = await market.getListingFee(price);
                contractListingFee = ethers.utils.formatUnits(
                    contractListingFee.toString(), 
                    'ether'
                );
                const listingFee = (price * 0.03).toFixed(2);
                expect(contractListingFee).to.equal(listingFee);
            }
        );
    });
});