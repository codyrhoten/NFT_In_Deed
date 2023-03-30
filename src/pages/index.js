import { useState, useEffect } from 'react';
import axios from 'axios';
import Web3Modal from 'web3modal';
import { ethers } from 'ethers';
import { houseNftAddress, marketAddress } from '../../config';
const Marketplace = require('../../artifacts/contracts/Market.sol/Market.json');
const HouseNFT = require('../../artifacts/contracts/HouseNFT.sol/HouseNFT.json');
import { Button, Col, Container, Row } from 'react-bootstrap';
import { toast } from 'react-toastify';
// import Image from 'next/image';
import { notify, update } from '../../utils/notification';
import TxModal from '../components/TxModal';

export default function HomePage() {
    const [show, setShow] = useState(false);
    const [houses, setHouses] = useState([]);
    const [isConnected, setIsConnected] = useState(false);
    const [walletAddress, setWallet] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    async function loadHouses() {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const houseNFTContract = new ethers.Contract(
            houseNftAddress,
            HouseNFT.abi,
            provider
        );
        const marketContract = new ethers.Contract(
            marketAddress,
            Marketplace.abi,
            provider
        );
        let _houses = await marketContract.getListedHouses();

        _houses = await Promise.all(
            _houses.map(async (h) => {
                try {
                    let houseURI = await houseNFTContract.tokenURI(h.houseId);
                    const meta = await axios.get(houseURI);
                    let price = ethers.utils.formatUnits(h.price.toString(), "ether");
                    const house = {
                        price: price - Math.floor(price) !== 0 ? price : Math.trunc(price),
                        houseId: h.houseId.toNumber(),
                        seller: h.seller,
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
            })
        );

        setHouses(_houses.filter((house) => house !== null));
    }

    async function walletListener() {
        try {
            const accounts = await ethereum.request({ method: 'eth_accounts' });

            if (accounts.length > 0) {
                setIsConnected(true);
                setWallet(accounts[0]);
            }

            ethereum.on('accountsChanged', async accounts => {
                if (accounts.length > 0) {
                    setWallet(accounts[0]);
                    setIsConnected(true);
                } else {
                    setIsConnected(false);
                    notify('Wallet', 'Connect to MetaMask using the \'Connect wallet\' button.');
                }
            });
        } catch (err) {
            console.log(err);
        }
    }

    useEffect(() => {
        loadHouses();
        walletListener();
    }, []);

    function houseOwner(id) {
        const _house = houses.map(h => {
            if (Number(h.houseId) == id && h.seller.toLowerCase() == walletAddress) {
                return h.seller.toLowerCase();
            }
        });

        console.log('house', _house)
        return _house[0];
    }

    async function buyHouse(house) {
        const isOwner = houseOwner(house.houseId);

        if (isOwner != undefined) {
            toast.error('You may not buy a house that you are selling.');
            return;
        }

        handleShow();

        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();
        const priceInWei = ethers.utils.parseUnits(house.price.toString(), 'ether');
        let tx = null;

        try {
            const marketContract = new ethers.Contract(
                marketAddress,
                Marketplace.abi,
                signer
            );

            tx = await marketContract.buyHouse(
                houseNftAddress,
                house.houseId,
                { value: priceInWei }
            );

            notify('Purchase', 'Purchasing house ...');

            await tx.wait();
            handleClose();
            update('Purchase', 'House successfully purchased!');
        } catch (err) {
            let errorMessage = '';

            if (err.message.includes('insufficient funds')) {
                errorMessage =
                    'Insufficient funds to cover the listing fee. Add more funds to your wallet to try again.';
            }

            if (err.message.includes("user rejected")) {
                errorMessage = "Transaction was rejected by the user. Try again?";
            }

            if (errorMessage) {
                toast.error(errorMessage);
            } else {
                console.log(err.message);
            }
        }

        handleClose();
        loadHouses();
    }

    if (houses.length === 0) {
        return (
            <h4 className='text-center' style={{ marginTop: '100px' }}>
                Be the first to list an NFT-in-deed! &#127968;
            </h4>
        );
    } else {
        return (
            <>
                <TxModal show={show} handleClose={handleClose} index={true} />
                <div className='mb-4 flex justify-center px-4' style={{ marginTop: '100px' }}>
                    <Container>
                        <Row xs='1' lg='3' className='justify-content-center'>
                            {houses.map((h, i) => (
                                <Col
                                    key={i}
                                    className='shadow rounded overflow-hidden m-3'
                                    lg={true}
                                >
                                    <p className='text-center mt-3'>
                                        <b>{h.address}</b>
                                    </p>
                                    <div className='text-center'>
                                        <img src={h.imageURL} className='rounded' height='125' />
                                    </div>
                                    <p className='text-center mt-2'>{h.price} ETH</p>
                                    <p align='center'>
                                        {`${h.bedrooms} bed, ${h.bathrooms} bath, ${h.houseSqFt} sq ft home, ${h.lotSqFt} sq ft lot, built ${h.yearBuilt}`}
                                    </p>
                                    <div className='text-center'>
                                        <Button
                                            style={{ display: isConnected ? 'block' : 'none' }}
                                            className='px-3 mx-auto mb-4'
                                            onClick={() => {
                                                buyHouse(h);
                                            }}
                                        >
                                            Buy
                                        </Button>
                                    </div>
                                </Col>
                            ))}
                        </Row>
                    </Container>
                </div>
            </>
        );
    }
}
