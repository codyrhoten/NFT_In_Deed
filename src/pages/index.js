import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { houseNftAddress, marketAddress } from '../../config';
const Marketplace = require('../../artifacts/contracts/Market.sol/Market.json');
const HouseNFT = require('../../artifacts/contracts/HouseNFT.sol/HouseNFT.json');
import axios from 'axios';
import { Container, Row } from 'react-bootstrap';

export default function HomePage() {
    const [houses, setHouses] = useState([]);
    const [loadingState, setLoadingState] = useState('not-loaded');

    async function loadHouses() {
        const provider = new ethers.providers.Web3Provider(ethereum);

        const houseNFTContract = new ethers.Contract(houseNftAddress, HouseNFT.abi, provider);
        const marketContract = new ethers.Contract(marketAddress, Marketplace.abi, provider);
        console.log(marketContract)
        const listings = await marketContract.getListedHouses();
        console.log(listings)

        const _houses = await Promise.all(listings.map(async h => {
            try {
                const houseURI = await houseNFTContract.tokenURI(h.tokenId);
                const meta = await axios.get(houseURI);
                console.log(houseURI, meta)
                const house = {
                    price: h.price,
                    houseId: h.houseId,
                    seller: h.seller,
                    owner: h.buyer,
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

    useEffect(() => { loadHouses() }, []);

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

    if (loadingState === 'loaded' && !houses.length) {
        return (
            <Row>
                <h4 className='mt-5 text-center'>
                    Be the first to list an NFT in-deed! &#127968;
                </h4>
            </Row>
        );
    } else {
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
    }
}