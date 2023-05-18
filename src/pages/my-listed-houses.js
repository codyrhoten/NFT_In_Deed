import { useEffect, useState } from 'react';
import Web3Modal from 'web3modal';
import { ethers } from 'ethers';
import { houseNftAddress, marketAddress } from '../../config';
const Marketplace = require('../../artifacts/contracts/Market.sol/Market.json');
const HouseNFT = require('../../artifacts/contracts/HouseNFT.sol/HouseNFT.json');
import axios from 'axios';
import { Container, Row } from 'react-bootstrap';
import DataCard from '../components/Card/Card';

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
                            {
                                houses.map((h, i) => (
                                    <DataCard
                                        key={i}
                                        houseData={h}
                                    />
                                ))
                            }
                        </Row>
                    </Container>
                </div>
            </div>
        );
    }
}