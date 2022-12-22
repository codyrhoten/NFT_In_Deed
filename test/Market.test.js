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

    return { house, mintedHouseId, listingFee };
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

        const price = ethers.utils.parseUnits('50', 'ether'); // 50 ETH

        return { houseNFT, market, owner, addr1, addr2, addr3, price };
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
                const { market, addr1 } = await loadFixture(deployContractsFixture);

                await expect(market.connect(addr1)
                    .getMarketOwnerBalance()).to.be
                    .revertedWith('Only the market owner can perform this action');
            }
        );

        it(
            'Should revert if msg.sender tries to access owner address but isn\'t owner',
            async () => {
                const { market, addr1 } = await loadFixture(deployContractsFixture);

                await expect(market.connect(addr1)
                    .getMarketOwner()).to.be
                    .revertedWith('Only the market owner can perform this action');
            }
        );

        it('Should return owner balance if msg.sender is owner', async () => {
            const { market } = await loadFixture(deployContractsFixture);
            const marketOwnerBal = await market.getMarketOwnerBalance();

            expect(marketOwnerBal).to.not.equal('0');
        });

        it('Should return owner address if msg.sender is owner', async () => {
            const { market, owner } = await loadFixture(deployContractsFixture);
            const marketOwner = await market.getMarketOwner();

            expect(marketOwner).to.equal(owner.address)
        });
    });

    describe('Listing houses on the market', () => {
        let houseNFT, addr1, market, price;

        before('Load deploy contracts fixture', async () => {
            const deployment = await loadFixture(deployContractsFixture);
            houseNFT = deployment.houseNFT;
            addr1 = deployment.addr1;
            market = deployment.market;
            price = deployment.price;
        });

        it('Should revert if asking price isn\'t greater than 1 wei', async () => {
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
                .listHouse(houseNFT.address, mintedHouseId, price, { value: listingFee }))
                .to.be.revertedWith('Price must be at least 1 wei');
        });

        it('Should get the listing fee at 3% of the price', async function () {
            const testListingFee = (Number(price) * 0.03);
            const contractListingFee = await market.getListingFee(price);

            expect(contractListingFee.toString()).to.equal(testListingFee.toString());
        });

        it('Should increase house ID by 1 after listing a house for sale', async () => {
            let houseIds = [];

            for (i = 0; i < 2; i++) {
                // mint and list a house
                let { house } = await listHouse(houseNFT, addr1, market, price);

                // get item id from listing event
                let listing = await house.wait();
                let events = listing.events;
                let event = events[events.length - 1];
                let value = event.args.houseId;
                let houseId = value.toNumber();
                houseIds.push(houseId);
            }

            expect(houseIds[1]).to.equal(houseIds[0] + 1);
        });

        it('Should transfer ownership of the minted house to market', async () => {
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
                .listHouse(houseNFT.address, mintedHouseId, price, { value: listingFee });

            // get new owner of the house from listing event
            const listing = await house.wait();
            const events = listing.events;
            const event = events[events.length - 1];
            const newOwner = event.args.owner;

            expect(firstHomeowner).to.not.eq(newOwner);
            expect(newOwner).to.eq(market.address);
        });

        it('Should transfer listing fee from seller to market', async () => {
            let marketBalBeforeListing = await ethers.provider.getBalance(market.address);
            marketBalBeforeListing = ethers.utils.formatEther(marketBalBeforeListing);

            // mint and list a house
            const { listingFee } = await listHouse(houseNFT, addr1, market, price);

            let marketBalAfterListing = await ethers.provider.getBalance(market.address);
            marketBalAfterListing = ethers.utils.formatEther(marketBalAfterListing);
            const listingFeeInEther = ethers.utils.formatEther(listingFee);
            const finalMarketBal = Number(marketBalBeforeListing) + Number(listingFeeInEther);

            expect(Number(marketBalAfterListing)).to.eq(finalMarketBal);
        });

        it('Should emit a HouseListed event', async () => {
            // use dummy URI to mint house
            const mintedHouse = await houseNFT
                .connect(addr1)
                .mint('https://whereikeepmynfts.com');
            const tx = await mintedHouse.wait();
            const mintEvent = tx.events[0];
            const mintedHouseId = mintEvent.args[2];

            // list that house
            let listingFee = await market.getListingFee(price);

            expect(market.connect(addr1)
                .listHouse(houseNFT.address, mintedHouseId, price, { value: listingFee })
            )
                .to.emit(market, 'HouseListed')
                .withArgs(mintedHouseId, houseNFT.address, addr1.address, market.address, price);
        });
    });

    describe('Selling houses on the market', () => {
        let houseNFT, addr1, market, price, addr2;

        before('Load deploy contracts fixture', async () => {
            const deployment = await loadFixture(deployContractsFixture);
            houseNFT = deployment.houseNFT;
            addr1 = deployment.addr1;
            market = deployment.market;
            price = deployment.price;
            addr2 = deployment.addr2;
        });

        it('Should revert if the wrong price is entered', async () => {
            const wrongPrice = '40000';

            // mint and list a house
            const { mintedHouseId } = await listHouse(houseNFT, addr1, market, price);

            // attempt to buy a house using a different price than listed
            await expect(market
                .connect(addr2)
                .buyHouse(houseNFT.address, mintedHouseId, { value: wrongPrice })
            )
                .to.be.revertedWith('Please submit the correct price');
        });

        it('Should provide the seller with price from buyer', async () => {
            // mint and list a house
            const { mintedHouseId } = await listHouse(houseNFT, addr1, market, price);

            let addr1BalAfterListing = await ethers.provider.getBalance(addr1.address);
            addr1BalAfterListing = ethers.utils.formatEther(addr1BalAfterListing);

            // buy that house
            let sale = await market
                .connect(addr2)
                .buyHouse(houseNFT.address, mintedHouseId, { value: price });
            sale = await sale.wait();

            let addr1BalAfterSale = await ethers.provider.getBalance(addr1.address);
            addr1BalAfterSale = ethers.utils.formatEther(addr1BalAfterSale);
            let priceInEther = ethers.utils.formatEther(price);
            let finalAddr1Bal = Number(addr1BalAfterListing) + Number(priceInEther);

            expect(Number(addr1BalAfterSale)).to.eq(finalAddr1Bal);
        });

        it('Should transfer ownership of listed house to buyer', async () => {
            // mint and list a house
            const { mintedHouseId } = await listHouse(houseNFT, addr1, market, price);

            const firstHomeowner = await houseNFT.ownerOf(mintedHouseId);

            // buy that house
            let sale = await market
                .connect(addr2)
                .buyHouse(houseNFT.address, mintedHouseId, { value: price });
            sale = await sale.wait();

            const newOwner = await houseNFT.ownerOf(mintedHouseId);

            expect(newOwner).to.not.eq(firstHomeowner);
            expect(newOwner).to.eq(addr2.address);
        });

        it('Should update who homeowner is in market contract', async () => {
            // mint and list a house
            const { mintedHouseId } = await listHouse(houseNFT, addr1, market, price);

            let sale = await market
                .connect(addr2)
                .buyHouse(houseNFT.address, mintedHouseId, { value: price });
            sale = await sale.wait();

            const events = sale.events;
            const event = events[events.length - 1];
            const owner = event.args.owner;

            expect(owner).to.eq(addr2.address);
        });

        it('Should emit HouseSold event', async () => {
            // mint and list a house
            const { mintedHouseId } = await listHouse(houseNFT, addr1, market, price);

            expect(await market
                .connect(addr2)
                .buyHouse(houseNFT.address, mintedHouseId, { value: price })
            )
                .to.emit(market, 'HouseSold')
                .withArgs(mintedHouseId, houseNFT.address, addr1.address, addr2.address, price);
        });

        it('Should transfer listing fee to market owner', async () => {
            let ownerBalBeforeSale = await market.getMarketOwnerBalance();
            ownerBalBeforeSale = ethers.utils.formatEther(ownerBalBeforeSale);

            // mint and list a house
            const { mintedHouseId, listingFee } = await listHouse(houseNFT, addr1, market, price);

            let sale = await market
                .connect(addr2)
                .buyHouse(houseNFT.address, mintedHouseId, { value: price });
            sale = await sale.wait();

            let ownerBalAfterSale = await market.getMarketOwnerBalance();
            ownerBalAfterSale = ethers.utils.formatEther(ownerBalAfterSale);
            const listingFeeInEther = ethers.utils.formatEther(listingFee);
            const finalOwnerBal = Number(ownerBalBeforeSale) + Number(listingFeeInEther);

            expect(Number(ownerBalAfterSale)).to.eq(finalOwnerBal);
        });
    });

    describe('Getting house data of the market', () => {
        it('Should get data of all houses available for sale on the market', async () => {
            const { houseNFT, addr1, market, price } = await loadFixture(deployContractsFixture);

            // mint and list 2 houses using first address
            for (i = 0; i < 2; i++) {
                // mint and list a house
                let { house } = await listHouse(houseNFT, addr1, market, price);
                await house.wait();
            }
            
            const houses = await market.getListedHouses();
            expect(houses.length).to.eq(2);
        });
        
        it('Should only get data of houses on the market purchased by msg.sender', async () => {
            const { 
                houseNFT, 
                addr1, 
                market, 
                price, 
                addr2 
            } = await loadFixture(deployContractsFixture);
            let houseIds = [];

            // mint and list 3 houses using first address            
            for (i = 0; i < 3; i++) {
                // mint and list a house
                let { mintedHouseId, house } = await listHouse(houseNFT, addr1, market, price);
                await house.wait();
                houseIds.push(mintedHouseId);
            }
            
            let allHousesBeforeSale = await market.getListedHouses();
            expect(allHousesBeforeSale.length).to.eq(3);
            
            // second address buys 1st house from first address
            let sale = await market
            .connect(addr2)
            .buyHouse(houseNFT.address, houseIds[0], { value: price });
            sale = await sale.wait();
            
            let allHousesAfterSale = await market.getListedHouses();

            const addr2Houses = await market.connect(addr2).getMyHouses();
            expect(allHousesAfterSale.length).to.eq(2);
            expect(addr2Houses.length).to.eq(1);
        });

        it('Should only get data of houses listed by msg.sender', async () => {
            const { 
                houseNFT, 
                addr1, 
                market, 
                price, 
                addr2 
            } = await loadFixture(deployContractsFixture);
            let mintedBy;

            // mint and list 2 houses using first address and one using 
            for (i = 0; i < 3; i++) {
                mintedBy = i == 0 ? addr2 : addr1;
                let { house } = await listHouse(houseNFT, mintedBy, market, price);
                await house.wait();
            }

            const allHouses = await market.getListedHouses();
            const addr2ListedHouses = await market.connect(addr2).getMyListedHouses();

            expect(allHouses.length).to.eq(3);
            expect(addr2ListedHouses.length).to.eq(1)
        });
    });
});