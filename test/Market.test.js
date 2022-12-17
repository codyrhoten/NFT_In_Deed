const { ethers } = require("hardhat");
const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');

const listHouse = async (nftContract, sender, marketContract, price) => {
    // use dummy URI to mint house
    let mintedHouse = await nftContract
        .connect(sender)
        .mint('https://whereikeepmynfts.com');
    let tx = await mintedHouse.wait();
    let mintEvent = tx.events[0];
    let mintedHouseId = mintEvent.args[2];

    // list that house
    let listingFee = await marketContract.getListingFee(price);
    let house = await marketContract.connect(sender).listHouse(
        nftContract.address,
        mintedHouseId,
        price,
        { value: listingFee }
    );

    return { house, mintedHouseId };
};

describe('Market Contract', () => {
    async function deployContractsFixture() {
        const Market = await ethers.getContractFactory('Market');
        const market = await Market.deploy();
        await market.deployed();

        const HouseNFT = await ethers.getContractFactory('HouseNFT');
        const houseNFT = await HouseNFT.deploy(market.address);
        await houseNFT.deployed();

        const [owner, addr1, addr2, addr3] = await ethers.getSigners();

        const price = '50000000000000000000'; // wei, or 50 ETH

        return {
            houseNFT,
            market,
            owner,
            addr1,
            addr2,
            addr3,
            price
        };
    }

    describe('Deployment', () => {
        it('Should set the right owner', async function () {
            const {
                market,
                owner
            } = await loadFixture(deployContractsFixture);

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
            const { market } = await loadFixture(deployContractsFixture);
            const marketOwnerBal = await market.getMarketOwnerBalance();

            expect(marketOwnerBal).to.not.equal('0');
        });

        it('Should return owner address if msg.sender is owner', async () => {
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
            'Should revert if asking price isn\'t greater than 1 wei',
            async () => {
                const {
                    houseNFT,
                    market,
                    addr1
                } = await loadFixture(deployContractsFixture);
                const price = '0';

                // mint a house
                let mintedHouse = await houseNFT
                    .connect(addr1)
                    .mint('https://whereikeepmynfts.com');
                let tx = await mintedHouse.wait();
                let mintEvent = tx.events[0];
                let mintedHouseId = mintEvent.args[2];

                // list that house
                let listingFee = await market.getListingFee(price);
                // list that house with a price lower than 1 wei
                await expect(market
                    .connect(addr1)
                    .listHouse(
                        houseNFT.address,
                        mintedHouseId,
                        price,
                        { value: listingFee }
                    )).to.be.revertedWith('Price must be at least 1 wei');
            }
        );

        it(
            'Should get the listing fee at 3% of the price',
            async function () {
                const {
                    market,
                    price
                } = await loadFixture(deployContractsFixture);

                const testListingFee = (Number(price) * 0.03);
                const contractListingFee = await market.getListingFee(price);

                expect(contractListingFee.toString())
                    .to.equal(testListingFee.toString());
            }
        );

        it(
            'Should increase house ID by 1 after listing a house for sale',
            async () => {
                const {
                    houseNFT,
                    addr1,
                    market,
                    price
                } = await loadFixture(deployContractsFixture);
                let houseIds = [];

                for (i = 0; i < 2; i++) {
                    // mint and list a house
                    let { house } =
                        await listHouse(
                            houseNFT,
                            addr1,
                            market,
                            price
                        );

                    // get item id from listing event
                    let listing = await house.wait();
                    let events = listing.events;
                    let event = events[events.length - 1];
                    let value = event.args.houseId;
                    let houseId = value.toNumber();
                    houseIds.push(houseId);
                }

                expect(houseIds[1]).to.equal(houseIds[0] + 1);
            }
        );

        it(
            'Should transfer ownership of the minted house to the market',
            async () => {
                const {
                    houseNFT,
                    addr1,
                    price,
                    market,
                } = await loadFixture(deployContractsFixture);

                // mint a house
                const mintedHouse = await houseNFT
                    .connect(addr1)
                    .mint('https://whereikeepmynfts.com');
                const tx = await mintedHouse.wait();
                const mintEvent = tx.events[0];
                const mintedHouseId = mintEvent.args[2];
                const firstHomeowner = await houseNFT.ownerOf(mintedHouseId);

                // list that house to the market
                const listingFee = await market.getListingFee(price);
                const house = await market
                    .connect(addr1)
                    .listHouse(
                        houseNFT.address,
                        mintedHouseId,
                        price,
                        { value: listingFee }
                    );

                // get new owner of the house from listing event
                const listing = await house.wait();
                const events = listing.events;
                const event = events[events.length - 1];
                const newOwner = event.args.owner;

                expect(firstHomeowner).to.not.eq(newOwner);
                expect(newOwner).to.eq(market.address);
            }
        );

        it('Should emit a HouseListed event', async () => {
            const {
                houseNFT,
                addr1,
                market,
                price,
            } = await loadFixture(deployContractsFixture);

            // mint and list a house
            const { house, mintedHouseId } =
                await listHouse(
                    houseNFT,
                    addr1,
                    market,
                    price
                );

            // get event emitted from listing house
            const listing = await house.wait();
            const events = listing.events;
            const event = events[events.length - 1];
            const eventParams = event.args;
            const { houseId, houseContract, seller, owner } = eventParams;

            expect(event.event).to.eq('HouseListed');
            expect(houseId.toString()).to.eq(mintedHouseId);
            expect(houseContract.toString()).to.eq(houseNFT.address);
            expect(seller.toString()).to.eq(addr1.address);
            expect(owner.toString()).to.eq(market.address);
            expect(eventParams.price.toString()).to.eq(price);
        });
    });

    describe('Selling houses on the market', () => {

    });

    describe('Returning houses to the market', () => {

    });
});