require('dotenv').config();
require("@nomicfoundation/hardhat-toolbox");
require('solidity-coverage');

const INFURA_API_KEY = process.env.NEXT_PUBLIC_IPFS_KEY_SECRET;
const GOERLI_DEPLOYER = process.env.GOERLI_PRIVATE_KEY_1;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    networks: {
        goerli: {
            url: `https://goerli.infura.io/v3/${INFURA_API_KEY}`,
            accounts: [GOERLI_DEPLOYER]
        }
    },
    solidity: "0.8.17",
};
