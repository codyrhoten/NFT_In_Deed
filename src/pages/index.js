import { useState, useEffect } from 'react';
import axios from 'axios';
// contract interaction modules
import Web3Modal from 'web3modal';
import { ethers } from 'ethers';
import { houseNftAddress, marketAddress } from '../../config';
const Marketplace = require('../../artifacts/contracts/Market.sol/Market.json');
const HouseNFT = require('../../artifacts/contracts/HouseNFT.sol/HouseNFT.json');
// front-end modules
import Loader from '../components/Loader';
import { toast } from 'react-toastify';
import { notify, update } from '../../utils/notification';
import { Container, Row } from 'react-bootstrap';
import TxModal from '../components/TxModal';
import DataCard from '../components/Card/Card';

export default function HomePage() {
    const [show, setShow] = useState(false);
    const [houses, setHouses] = useState([]);
    const [isConnected, setIsConnected] = useState(false);
    const [walletAddress, setWallet] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    useEffect(() => {
        walletListener();
        loadHouses();
    }, []);

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

    function houseOwner(id) {
        const _house = houses.map(h => {
            if (Number(h.houseId) == id && h.seller.toLowerCase() == walletAddress) {
                return h.seller.toLowerCase();
            }
        });

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
            <h4 className='text-center' style={{ marginTop: '7rem' }}>
                Be the first to list an NFT-in-deed! &#127968;
            </h4>
        );
    } else {
        return (
            <>
                <TxModal show={show} handleClose={handleClose} index={true} />
                <div className='mb-4 flex justify-center px-4' style={{ marginTop: '150px' }}>
                    <Container>
                        <Row xs='1' lg='3' className='justify-content-center'>
                            {
                                houses.map((h, i) => (
                                    <DataCard
                                        key={i}
                                        houseData={h}
                                        isConnected={isConnected}
                                        clickHandler={buyHouse}
                                        page='index'
                                    />
                                ))
                            }
                        </Row>
                    </Container>
                </div>
            </>
        );
    }
}
