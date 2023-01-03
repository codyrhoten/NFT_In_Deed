import { Container } from 'react-bootstrap';
import axios from 'axios';
import { ethers } from 'ethers';
import { houseNftAddress, marketAddress } from '../../config';
import { useState, useEffect } from 'react';
const Marketplace = require('../../artifacts/contracts/Market.sol/Market.json');
const HouseNFT = require('../../artifacts/contracts/HouseNFT.sol/HouseNFT.json');

export default function HomePage() {
    const [houses, setHouses] = useState([]);
    const [loadingState, setLoadingState] = useState('not-loaded');
    // need to deploy contracts before using this function
    async function loadHouses() {
        const provider = new ethers.providers.Web3Provider(ethereum);
        ethereum.request({ method: 'eth_requestAccounts' });

        const houseNFTContract = new ethers.Contract(houseNftAddress, HouseNFT.abi, provider);
        const marketContract = new ethers.Contract(marketAddress, Marketplace.abi, provider);
        const listings = await marketContract.getListedHouses();

        const _houses = await Promise.all(listings.map(async i => {
            try {
                const houseURI = await houseNFTContract.tokenURI(i.tokenId);
                const meta = await axios.get(houseURI);
                const house = {
                    price: i.price,
                    houseId: i.houseId,
                    seller: i.seller,
                    owner: i.buyer,
                    address: meta.data.address,
                    imageURL: meta.data.imageURL,
                    bedrooms: meta.data.bedrooms,
                    bathrooms: meta.data.bathrooms,
                    houseSqFt: meta.data.houseSqFt,
                    lotSqFt: meta.data.lotSqFt,
                    yearBuilt: meta.data.yearBuilt,
                };
                return house;
            } catch (err) {
                console.log(err);
                return null;
            }
        }));

        setHouses(_houses.filter(house => house !== null));
        setLoadingState('loaded');
    }

    // useEffect(loadHouses(), []);

    async function buyHouse(house) {
        const provider = new ethers.providers.Web3Provider(window.Ethereum);
        const signer = provider.getSigner();

        if (window.ethereum) {
            provider.send("eth_requestAccounts", []);
        } else {
            console.log('Please install MetaMask');
            return;
        }
       
        const marketContract = new ethers.Contract(marketAddress, Marketplace.abi, signer);
        const tx = await marketContract.buyHouse(
            houseNftAddress, 
            house.houseId, 
            { value: house.price }
        );
        const receipt = await tx.wait();
        console.log(receipt);
        loadHouses();
    }

    /* if (loadingState === 'loaded' && !houses.length) { */
        return (<h1>There are no houses on the market at this time</h1>);
    /* } else {
        return (
            <div className='flex justify-center'>
                <div className='px-4'>
                    <Container className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4'>
                        {
                            houses.map((h, i) => {
                                <div key={i} className='border shadow rounded-xl overflow-hidden'>
                                    <img src={h.imageURL} />
                                    <div className='p-4'>
                                        <p
                                            style={{ height: '64px' }}
                                            className='text-2xl font-semibold'
                                        >
                                            {h.address}
                                        </p>
                                        <div style={{ height: '70px', overflow: 'hidden' }}>
                                            <p className='text-gray-400'>
                                                {`${h.bedrooms} bed, ${h.bathrooms} bath, ${h.houseSqFt} sq ft home, ${h.lotSqFt} sq ft lot, built ${h.yearBuilt}`}
                                            </p>
                                        </div>
                                    </div>
                                    <div className='p-4 bg-black'>
                                        <p className='text-2xl font-bold text-white'>
                                            {h.price} ETH
                                        </p>
                                        <button
                                            className='mt-4 w-full bg-teal-400 text-white font-bold py-2 px-12 rounded'
                                            onClick={() => buyHouse(h)}
                                        >
                                            Buy
                                        </button>
                                    </div>
                                </div>
                            })
                        }
                    </Container>
                </div>
            </div>
        );
    } */
}