async function main() {
    // Contracts deployer
    const [deployer] = await ethers.getSigners();
    console.log('Contracts deployed with the account:', deployer.address);

    // NFT-in-Deed Marketplace contract deployment
    const NFT_in_Deed_Market = await ethers.getContractFactory('Market');
    const marketContract = await NFT_in_Deed_Market.deploy();
    await marketContract.deployed();
    console.log('NFT-in-Deed Market deployed to:', marketContract.address);

    // NFT-in-Deed Token contract deployment
    const HouseNFT = await ethers.getContractFactory('HouseNFT');
    const deedTokenContract = await HouseNFT.deploy(marketContract.address);
    await deedTokenContract.deployed();
    console.log('house deployed to:', deedTokenContract.address);
}

main()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });