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
    });

    describe('Owner-only functions', () => {
        it(
            'Should revert if msg.sender tries to access owner balance but isn\'t owner',
            async () => {
                const {
                    market,
                    addr1
                } = await loadFixture(deployContractsFixture);
                await expect(market.connect(addr1)
                    .getMarketOwnerBalance()).to.be
                    .revertedWith(
                        'Only the market owner can perform this action'
                    );
            }
        );

        it(
            'Should revert if msg.sender tries to access owner address but isn\'t owner',
            async () => {
                const {
                    market,
                    addr1
                } = await loadFixture(deployContractsFixture);
                await expect(market.connect(addr1)
                    .getMarketOwner()).to.be
                    .revertedWith(
                        'Only the market owner can perform this action'
                    );
            }
        );

        it('Should return owner balance if msg.sender is owner', async () => {
            const {
                market,
                owner
            } = await loadFixture(deployContractsFixture);
            const marketOwner = await market.getMarketOwner();
            expect(marketOwner).to.equal(owner.address)
        });
    });

    describe('Listing houses on the market', () => {
        it(
            'Should get the listing fee at 3% of the price',
            async function () {
                const {
                    addr1,
                    market,
                    houseNFT,
                    houseNFTAddress
                } = await loadFixture(deployContractsFixture);

                // mint a house with a dummy URI
                await houseNFT
                    .connect(addr1)
                    .mint('https://whereikeepmynfts.com');

                // list that house with price in wei
                const price = '50000000000000000000';
                const listingFee = (Number(price) * 0.03);
                await market.connect(addr1).listHouse(
                    houseNFTAddress,
                    '1',
                    price,
                    { value: listingFee.toString() }
                );

                // get the listing fee that's based on that house's market 
                // price
                let contractListingFee = await market.getListingFee(price);
                expect(contractListingFee.toString())
                    .to
                    .equal(listingFee.toString());
            }
        );
    });

    describe('Selling houses on the market', () => {

    });

    describe('Returning houses to the market', () => {

    });
});