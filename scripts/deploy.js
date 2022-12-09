async function main() {
    const NFT_in_Deed_Market = await ethers.getContractFactory('Market');
    const market = await NFT_in_Deed_Market.deploy();
    await market.deployed();
    console.log('NFT in Deed Market deployed to:', market.address);

    const HouseNFT = await ethers.getContractFactory('HouseNFT');
    const house = await HouseNFT.deploy();
    await house.deployed();
    console.log('house deployed to:', house.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });