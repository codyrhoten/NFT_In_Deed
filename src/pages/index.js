import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { houseNftAddress, marketAddress } from '../../config';
const Marketplace = require('../../artifacts/contracts/Market.sol/Market.json');
const HouseNFT = require('../../artifacts/contracts/HouseNFT.sol/HouseNFT.json');
import axios from 'axios';
import { Button, Col, Container, Row } from 'react-bootstrap';

export default function HomePage() {
    const [houses, setHouses] = useState([]);
    const [loadingState, setLoadingState] = useState('not-loaded');

    async function loadHouses() {
        const provider = new ethers.providers.Web3Provider(ethereum);

        const houseNFTContract = new ethers.Contract(houseNftAddress, HouseNFT.abi, provider);
        const marketContract = new ethers.Contract(marketAddress, Marketplace.abi, provider);
        const listings = await marketContract.getListedHouses();
        console.log(listings);

        const _houses = await Promise.all(listings.map(async h => {
            try {
                const houseURI = await houseNFTContract.tokenURI(h.houseId);
                const meta = await axios.get(houseURI);
                let price = ethers.utils.formatUnits(h.price.toString(), 'ether');
                console.log(houseURI, meta)
                const house = {
                    price: Math.trunc(price),
                    houseId: h.houseId.toNumber(),
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
        console.log(houses)
        setLoadingState('loaded');
    }

    useEffect(() => { loadHouses() }, []);

    async function buyHouse(house) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();

        if (ethereum) {
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

    if (loadingState === 'loaded' && houses.length === 0) {
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
                    <Container /* className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4' */>
                        <Row xs={1} md={3}>
                            {houses.map((h, i) => (
                                <Col key={i} className='shadow rounded overflow-hidden m-2'>
                                    <p className='text-center mt-3'>{h.address}</p>
                                    <div className='text-center'>
                                        <img src={h.imageURL} className='rounded' height='100' />
                                    </div>
                                    <p align='center'>{h.price} ETH</p>
                                    <p className='p-1' align='center'>
                                        {`${h.bedrooms} bed, ${h.bathrooms} bath, ${h.houseSqFt} sq ft home, ${h.lotSqFt} sq ft lot, built ${h.yearBuilt}`}
                                    </p>
                                    <div className='text-center'>
                                        <Button
                                            className='px-3 mx-auto mb-2'
                                            onClick={() => { buyHouse(h) }}
                                        >
                                            Buy
                                        </Button>
                                    </div>
                                </Col>
                            ))}
                        </Row>
                    </Container>
                </div>
            </div>
        );
    }
}