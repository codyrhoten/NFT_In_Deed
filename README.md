# NFT-in-Deed Market - DApp


<img src="/src/public/home-pg.png" alt="home page">

<a href="https://nft-in-deed.vercel.app//">View NFT-in-Deed Market</a>

## About

Created an application that interacts with smart contracts which maintain house deeds tokenized as NFTs. The app serves as a market place to list and buy these NFT deeds (and all the property rights that go along with that in a world where legally tokenized deeds are commonplace). It is currently available to play with on the Goerli testnet.

### Back End

#### Smart Contracts

- One that functions as a minter for NFTs
- The other is the market place where users can list and sell their NFT deeds

#### Optimization

- Inherits audited and tested Open Zeppelin [ERC721 contracts](https://github.com/OpenZeppelin/openzeppelin-contracts/tree/master/contracts/token/ERC721) for NFT management

#### Security

- Re-entrancy attacks are handled through Open Zeppelin's [nonReentrant library](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/security/ReentrancyGuard.sol)

### Front End

#### Status

- View all the houses that are listed, only the houses you've purchased or only the houses you've listed

#### Transactions

- Users can connect their [MetaMask](https://metamask.io/) wallet to confirm transactions:
    
    - Mint the deed as a tokenized NFT followeed by an immediate transaction to list it to the market place
    - Buy the deed
    - Approve the market to re-list the deed, followed by an immediate transaction to re-list it

#### Notifications

- The app lets users know when:
    - MetaMask isn't installed
    - transactions were rejected by the user
    - transaction is being validated on the Goerli network
    - transaction has succeeded

### Unit Testing

Hardhat is a professional environment for Ethereum development.

<img src="/src/public/contracts-tests.png" alt="Tests" >

<img src="/src/public/contracts-test-coverage.png" alt="Coverage" >

### Off-Chain Storage

[IPFS](https://ipfs.io/), or InterPlanetary Filing System, is a network for storing and sharing data in a peer-to-peer distributed file system.

### Languages

- [Solidity](https://docs.soliditylang.org/en/v0.8.9/)
- [JavaScript](https://www.javascript.com/)

### Built with

- [Ethers](https://docs.ethers.io/v5/)
- [Hardhat](https://hardhat.org/)
- [MetaMask](https://metamask.io/)
- [IPFS](https://ipfs.io/)
- [Next.js](https://nextjs.org/)

## Created by 

- [Cody Rhoten | LinkedIn](https://www.linkedin.com/in/codyrhoten/)