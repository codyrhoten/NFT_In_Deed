import { useEffect, useState } from 'react';
import Web3Modal from 'web3modal';
import { ethers } from 'ethers';
import { houseNftAddress, marketAddress } from '../../config';
const Marketplace = require('../../artifacts/contracts/Market.sol/Market.json');
const HouseNFT = require('../../artifacts/contracts/HouseNFT.sol/HouseNFT.json');
import axios from 'axios';
import { Col, Container, Row } from 'react-bootstrap';

export default function MyListedHouses() {
    const [houses, setHouses] = useState([]);

    async function loadMyListedHouses() {
        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();
        const houseNFTContract = new ethers.Contract(houseNftAddress, HouseNFT.abi, provider);
        const marketContract = new ethers.Contract(marketAddress, Marketplace.abi, signer);
        let myHouses = await marketContract.getMyListedHouses();

        myHouses = await Promise.all(myHouses.map(async h => {
            try {
                const houseURI = await houseNFTContract.tokenURI(h.houseId);
                const meta = await axios.get(houseURI);
                let price = ethers.utils.formatUnits(h.price.toString(), 'ether');
                const house = {
                    price: price - Math.floor(price) !== 0 ? price : Math.trunc(price),
                    houseId: h.houseId.toNumber(),
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

        setHouses(myHouses.filter(house => house !== null));
    }

    useEffect(() => { loadMyListedHouses() }, []);

    if (houses.length === 0) {
        return (
            <h4 className='text-center' style={{ marginTop: '7.5rem' }}>
                This wallet doesn't contain any listed NFT In-Deeds
            </h4>
        );
    } else {
        return (
            <div className='mb-4 flex justify-center' style={{ marginTop: '7rem' }}>
                <div className='px-4'>
                    <Container>
                        <h4 className='my-5 text-center'>My NFT In-Deeds on the market</h4>
                        <Row xs='1' lg='3' className='justify-content-md-center'>
                            {houses.map((h, i) => (
                                <Col key={i} className='shadow rounded overflow-hidden mx-2' lg={true}>
                                    <p className='text-center mt-3'><b>{h.address}</b></p>
                                    <div className='text-center'>
                                        <img src={h.imageURL} className='rounded' height='125' />
                                    </div>
                                    <p className='text-center mt-2'>{h.price} ETH</p>
                                    <p align='center'>
                                        {`${h.bedrooms} bed, ${h.bathrooms} bath, ${h.houseSqFt} sq ft home, ${h.lotSqFt} sq ft lot, built ${h.yearBuilt}`}
                                    </p>
                                </Col>
                            ))}
                        </Row>
                    </Container>
                </div>
            </div>
        );
    }
}