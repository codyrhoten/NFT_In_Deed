const { ethers } = require("hardhat");
const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');

describe('House NFT Contract', () => {
    async function deployContractsFixture() {
        const Market = await ethers.getContractFactory('Market');
        let market = await Market.deploy();
        await market.deployed();

        const HouseNFT = await ethers.getContractFactory('HouseNFT');
        let houseNFT = await HouseNFT.deploy(market.address);
        await houseNFT.deployed();

        const [owner, addr1, addr2] = await ethers.getSigners();

        return {
            houseNFT,
            market,
            owner,
            addr1,
            addr2,
        };
    }

    describe('Deployment', () => {
        it('Should set the Market contract\'s address', async function () {
            const { houseNFT, market } = await loadFixture(deployContractsFixture);
            expect(await houseNFT.marketContract()).to.equal(market.address);
        });
    });

    describe('House NFT Creation', () => {
        let houses = [];

        it('Should update the house id count', async () => {
            const { houseNFT, addr1 } = await loadFixture(deployContractsFixture);

            for (i = 0; i < 2; i++) {
                let house = await houseNFT
                    .connect(addr1)
                    .mint(`https://www.whereikeepmynfts.com/token/${i}`);
                let tx = await house.wait();
                let event = tx.events[0];
                let houseId = Number(event.args[2]);
                houses.push(houseId);
            }

            expect(houses[1]).to.be.eq(houses[0] + 1);
        });

        it('Should update the user\'s token balance', async () => {
            const { houseNFT, owner } = await loadFixture(deployContractsFixture);
            const ownerBalBeforeMint = await houseNFT.balanceOf(owner.address);
            const house = await houseNFT.connect(owner).mint('https://www.whereikeepmynfts.com');
            await house.wait();
            const ownerBalAfterMint = await houseNFT.balanceOf(owner.address);
            expect(Number(ownerBalAfterMint)).to.be.eq(Number(ownerBalBeforeMint) + 1);
        });

        it('Should set the user as the token owner', async () => {
            const { houseNFT, addr1 } = await loadFixture(deployContractsFixture);
            const house = await houseNFT.connect(addr1).mint('https://www.whereikeepmynfts.com');
            const tx = await house.wait();
            const event = tx.events[0];
            const houseId = Number(event.args[2]);
            const homeOwner = await houseNFT.ownerOf(houseId);
            expect(addr1.address).to.be.eq(homeOwner);
        });

        it('Should emit a Transfer event', async () => {
            const { houseNFT, addr1 } = await loadFixture(deployContractsFixture);
            expect(houseNFT.connect(addr1).mint('https://www.whereikeepmynfts.com'))
                .to.emit(houseNFT, 'Transfer');
        });
    });
});