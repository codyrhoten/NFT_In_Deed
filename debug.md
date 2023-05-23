# Debug History of NFT In-deed

### Issue \#1 1/9/23:
"Should only get data of houses on the market purchased by msg.sender" test fails in Market contract 
project
#### Error: 
call revert exception; VM Exception while processing transaction: reverted with panic code 50 [ See: https://links.ethers.org/v5-errors-CALL_EXCEPTION ] (method="getListedHouses()", data="0x4e487b710000000000000000000000000000000000000000000000000000000000000032", errorArgs=[{"type":"BigNumber","hex":"0x32"}], errorName="Panic", errorSignature="Panic(uint256)", reason=null, code=CALL_EXCEPTION, version=abi/5.7.0)
Reason accd to docs: 0x32: If you access an array, bytesN or an array slice at an out-of-bounds or negative index (i.e. x[i] where i >= x.length or i < 0).
#### Solution 1/10/23: 
After mentally iterating through getListedHouses(), I found that after buying a house and changing the number of 
listed houses, the index of the houses array created in this fn didn't contain a "0th" element if the first house was 
purchased, and Solidity doesn't allow me to simply push the houses to the array; they have to be set equal to the exact 
element in the array, and with no more "0th" element existing, it threw a panic 50 revert to show that an element was out 
of bounds in some way.

### Issue \#2 1/10/23:
Home pg of NFT-in-Deed project doesn't render but instead throws error on screen (Next.js)
#### Error: 
call revert exception [ See: https://links.ethers.org/v5-errors-CALL_EXCEPTION ] (method="getListedHouses()", data="0x", errorArgs=null, errorName=null, errorSignature=null, reason=null, code=CALL_EXCEPTION, version=abi/5.7.0)
#### Observation: 
Not due to no connected wallet. I can close the error and connect the wallet
#### Solution 1/10/23: 
Reload the page.

### Issue \#3 1/10/23:
Hardhat won't deploy the contracts to the hardhat network localhost
#### Error HH308: 
Unrecognized positional argument localhost
#### Solution 1/10/23: 
I was missing 1 '-' before the network flag in my terminal command to deploy contracts

### Issue \#4 1/10/23:
List a Home pg (index.js) doesn't display uploaded pic
#### Reason: 
CORS request did not succeed

### Issue \# 5 1/12/23:
Won't mint a house using NFT contract
#### MetaMask - 
RPC Error: [ethjs-query] while formatting outputs from RPC '{"value":{"code":-32603,"data":{"code":-32000,"message":"Nonce too high. Expected nonce to be 0 but got 3. Note that transactions can't be queued when automining.","data":{"message":"Nonce too high. Expected nonce to be 0 but got 3. Note that transactions can't be queued when automining."}}}}' 
#### Solution: 
Reset account after having rebooted local blockchain instance (Hardhat network)

### Issue \#6 1/12/23:
React-Toast is huge on screen
#### Solution:
import react-toast css in _app.js file

### Issue \#7 1/13/23:
Contracts won't deploy on Goerli test network
#### Error: 
could not detect network (event="noNetwork", code=NETWORK_ERROR, version=providers/5.7.2)
#### Observation:
.env file is being read, as the deploy.js file did log the deployer's address to the console as programmed
#### Solution: Used IPFS Infura project info rather than the Web3 API project info, which I had to create.

### Issue \#8 1/13/23:
IPFS won't authorize my dapp to send meta data to it
#### HTTPError: 
basic auth failure: invalid project id or project secret
#### Solution: 
started working again on its own

### Issue \#9 1/16/23:
Can't relist house deed
#### Error:
revert ERC721: transfer caller is not token owner or approved
#### Solution:
[Stack Exchange](https://ethereum.stackexchange.com/questions/117944/why-do-i-keep-receiving-this-error-revert-erc721-transfer-caller-is-not-owner)

### Issue \# 10 2/11/23: 
IPFS isn't returning image data on home pg of NFT-in-Deed project due to too many requests
#### Status Code: 
429 Too Many Requests from IPFS

### Issue \#11 2/11/23: 
IPFS returns 403 Status Code (Forbidden) when the file is changed in Tokenize-and-List-House pg of 
NFT-in-Deed project, so image doesn't render
#### HTTPError: 
not allowed - invalid origin

### Issue \#12 5/18/23:
MetaMask network modal would pop up even if on Goerli network
#### Solution 5/21/23:
ChatGPT helped me to see that I needed to move the setNetwork hook before the wallet listener
in the useEffect(), make it await before the listener and switch the ethereum.networkVersion
object to the ethereum.request() that finds the chain ID.

### Issue \#13 5/21/23:
Mozilla doesn't retrieve houses' data from contract although Chrome does.
#### Error: 
.../l.onerror@https://nftindeed.codyrhoten.com/_next/static/chunks/594-b467141c68604b44.js:1:18800\n", message: "Network Error", name: "AxiosError", code: "ERR_NETWORK", config: {…}, request: XMLHttpRequest }
code: "ERR_NETWORK"
​config: Object { timeout: 0, xsrfCookieName: "XSRF-TOKEN", xsrfHeaderName: "X-XSRF-TOKEN", … }
​message: "Network Error"
​name: "AxiosError"
​request: XMLHttpRequest { readyState: 4, timeout: 0, withCredentials: false, … }
#### Solution:
Canopy content blocker was blocking Mozilla's ability to make an Axios request to IPFS to retrieve
the house metadata.

### Issue \#14 5/22/23:
Data doesn't upload to IPFS.
#### Error: 
HTTPError: not allowed - invalid origin - Forbidden 403
#### Solution:
Whitelist my localhost port (currently running) and website origin on Infura IPFS project