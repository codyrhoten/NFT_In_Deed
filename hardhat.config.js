require('dotenv').config();
require("@nomicfoundation/hardhat-toolbox");
require('solidity-coverage');

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    networks: {
        goerli: {
            url: `https://goerli.infura.io/v3/${process.env.INFURA_API_KEY}`,
            accounts: [process.env.GOERLI_PRIVATE_KEY_1]
        }
    },
    solidity: "0.8.17",
};
