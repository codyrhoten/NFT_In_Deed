const { loadFixture } = require('@nomicfoundation/harhat-network-helpers');
const { expect } = require('chai');

describe('Market Contract', () => {
    async function deployMarketFixture() {
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

    describe('Deployment', () => {
        it('Should set the right owner', async function () {
            const { market, owner } = await loadFixture(deployMarketFixture);
            expect(await market._marketOwner()).to.equal(owner.address);
        });

        it(
            'Should get the listing fee at 3% of the price', 
            async function () {
                const price = '115';
                let listingFee = await market.getListingFee(price);
                listingFee = ethers.utils.formatUnits(
                    listingFee.toString(), 
                    'ether'
                );
                const listingPercentage = 0.03;
                expect(listingFee).to.equal(Number(price) * listingPercentage);
            }
        );
    });
});