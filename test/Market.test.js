const { ethers } = require("hardhat");
const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');

async function mintHouse(address, contract) {
    const house = await contract
        .connect(address)
        .mint('https://whereikeepmynfts.org');
    const txn = await house.wait();
    const event = txn.events[2]
    const value = event.args[0];
    return (tokenId = value.toNumber());
}

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

        /* it(
            'Should get the listing fee at 3% of the price',
            async function () {
                const { addr1, market, houseNFT } = await loadFixture(deployContractsFixture);
                const tokenId = await mintHouse(addr1, houseNFT);
                const price = '115';
                let contractListingFee = await market.getListingFee(tokenId);
                contractListingFee = ethers.utils.formatUnits(
                    contractListingFee.toString(), 
                    'ether'
                );
                const listingFee = (price * 0.03);
                expect(contractListingFee.toString()).to.equal(listingFee.toString());
            }
        ); */
    });
});