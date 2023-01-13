import { useState } from 'react';
import { useRouter } from 'next/router'
import { create as ipfsHttpClient } from 'ipfs-http-client'
import Web3Modal from 'web3modal';
import { ethers } from 'ethers';
const Marketplace = require('../../artifacts/contracts/Market.sol/Market.json');
const HouseNFT = require('../../artifacts/contracts/HouseNFT.sol/HouseNFT.json');
import { houseNftAddress, marketAddress } from '../../config';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import { notify, update } from '../../utils/notification';
import Transacting from '../components/Transacting';

const projectSecret = process.env.NEXT_PUBLIC_IPFS_KEY_SECRET;
const projectId = process.env.NEXT_PUBLIC_IPFS_PROJECT_ID;
const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');

const client = ipfsHttpClient({
    host: 'ipfs.infura.io',
    port: 5001,
    protocol: 'https',
    headers: { authorization: auth, },
});

export default function ListHome() {
    const [fileUrl, setFileUrl] = useState(null);
    const [isTransacting, setIsTransacting] = useState(false);
    const [error, setError] = useState('');
    const [formInput, updateFormInput] = useState({
        priceInEth: '',
        address: '',
        imageURL: '',
        bedrooms: '',
        bathrooms: '',
        houseSqFt: '',
        lotSqFt: '',
        yearBuilt: '',
    });

    const router = useRouter();

    async function onChange(e) {
        // upload image to IPFS
        const file = e.target.files[0];

        try {
            const added = await client.add(
                file,
                { progress: prog => console.log(`received: ${prog}`) }
            );
            const url = `https://nftindeed.infura-ipfs.io/ipfs/${added.path}`;
            setFileUrl(url);
        } catch (err) {
            toast.error('Error uploading file');
        }
    }

    async function uploadToIPFS() {
        const {
            priceInEth,
            address,
            bedrooms,
            bathrooms,
            houseSqFt,
            lotSqFt,
            yearBuilt
        } = formInput;

        if (
            !priceInEth ||
            !address ||
            !houseSqFt ||
            !lotSqFt ||
            !yearBuilt
        ) {
            return;
        } else {
            // upload metadata to IPFS
            const data = JSON.stringify({
                address,
                imageURL: fileUrl,
                bedrooms,
                bathrooms,
                houseSqFt,
                lotSqFt,
                yearBuilt
            });

            try {
                const added = await client.add(data);
                console.log('added: ', added);
                const url = `https://nftindeed.infura-ipfs.io/ipfs/${added.path}`;
                // return the URL to use it in the transaction
                return url;
            } catch(error) {
                toast.error('Error uploading file');
            }
        }
    }

    async function tokenizeAndListHouse(e) {
        e.preventDefault();

        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);
        const url = await uploadToIPFS();
        const signer = provider.getSigner();

        try {
            setIsTransacting(true);
            // Mint a house
            const houseNFTContract = new ethers.Contract(houseNftAddress, HouseNFT.abi, signer);
            const marketContract = new ethers.Contract(marketAddress, Marketplace.abi, signer);

            let mintedHouse = await houseNFTContract.mint(url);
            notify('NFT-in-Deed', 'House tokenization happening now ...')
            let mintTx = await mintedHouse.wait();
            update('NFT-in-Deed', 'House successfully tokenized!');
            let mintEvent = mintTx.events[0];
            let mintedHouseId = mintEvent.args[2];
            console.log('minted house ', mintedHouseId);

            // List the house
            let priceInWei = ethers.utils.parseUnits(formInput.priceInEth, 'ether');
            let listingFee = await marketContract.getListingFee(priceInWei);
            listingFee = listingFee.toString();
            notify('Market', 'Listing new NFT-in-Deed ...');

            const listing = await marketContract.listHouse(
                houseNftAddress,
                mintedHouseId,
                priceInWei,
                { value: listingFee }
            );

            listing.wait();
            update('Market', 'NFT-in-Deed successfully listed!');
            setIsTransacting(false);
            router.push('/');
        } catch (err) {
            console.log(err.message);

            if (err.message.includes('user rejected transaction')) {
                setError('The transaction was rejected. Try again?');
            }

            toast.error(err.message.split(':')[1]);
        }
    }

    function getBedroomOptions() {
        let bedrooms = [];

        for (let i = 1; i <= 8; i++) {
            bedrooms.push(<option key={i} option={i.toString()}>{i.toString()}</option>);
        }

        return bedrooms;
    }

    function getBathroomOptions() {
        let bathrooms = [];

        for (let i = 2; i <= 12; i++) {
            const option = (i / 2).toString();
            bathrooms.push(<option key={i} value={option}>{option}</option>);
        }

        return bathrooms;
    }

    return (
        <>
            <ToastContainer position='top-right' />
            {isTransacting ? (
                <Transacting />
            ) : (
                <Container className='flex justify-center'>
                    <div className='flex flex-col pb-12'>
                        <h2 className='mt-4 text-center'>List your house</h2>
                        <Form className='justify-content-md-center' onSubmit={tokenizeAndListHouse}>
                            {error && <p className='text-center text-danger mt-5'>{error}</p>}
                            <Col className={error ? 'mt-1' : 'mt-5'}>
                                <Form.Control
                                    placeholder='street, apt/suite/floor, city, state, zip'
                                    className='border rounded p-2'
                                    value={formInput.address ? formInput.address : ''}
                                    onChange={e => updateFormInput({
                                        ...formInput,
                                        address: e.target.value
                                    })}
                                />
                            </Col>
                            <Col sm={2} className='mt-4'>
                                <Form.Control
                                    placeholder='price in ETH'
                                    className='border rounded'
                                    value={formInput.priceInEth ? formInput.priceInEth : ''}
                                    onChange={e => updateFormInput({
                                        ...formInput,
                                        priceInEth: e.target.value
                                    })}
                                />
                            </Col>
                            <Form.Control
                                type="file"
                                name="House"
                                className="mt-4"
                                onChange={onChange}
                            />
                            {
                                fileUrl &&
                                <div className='text-center'>
                                    <img className='rounded mt-4' width='350' src={fileUrl} />
                                </div>
                            }
                            <Row className='mt-4' xs={2}>
                                <Col sm={1}>
                                    <Form.Group>
                                        <Form.Label>Bedrooms</Form.Label>
                                        <Form.Select
                                            onChange={e => updateFormInput({
                                                ...formInput,
                                                bedrooms: e.target.value
                                            })}
                                        >
                                            {getBedroomOptions()}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col sm={1}>
                                    <Form.Group>
                                        <Form.Label>Bathrooms</Form.Label>
                                        <Form.Select
                                            onChange={e => updateFormInput({
                                                ...formInput,
                                                bathrooms: e.target.value
                                            })}
                                        >
                                            {getBathroomOptions()}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col sm={2}>
                                    <Form.Group>
                                        <Form.Label>Interior Sq Ft</Form.Label>
                                        <Form.Control
                                            placeholder='1,250'
                                            value={formInput.houseSqFt ? formInput.houseSqFt : ''}
                                            onChange={e => updateFormInput({
                                                ...formInput,
                                                houseSqFt: e.target.value
                                            })}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col sm={2}>
                                    <Form.Group>
                                        <Form.Label>Lot Sq Ft</Form.Label>
                                        <Form.Control
                                            placeholder='10,000'
                                            value={formInput.lotSqFt ? formInput.lotSqFt : ''}
                                            onChange={e => updateFormInput({
                                                ...formInput,
                                                lotSqFt: e.target.value
                                            })}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col sm={2}>
                                    <Form.Group>
                                        <Form.Label>Year built</Form.Label>
                                        <Form.Control
                                            placeholder='YYYY'
                                            value={formInput.yearBuilt ? formInput.yearBuilt : ''}
                                            onChange={e => updateFormInput({
                                                ...formInput,
                                                yearBuilt: e.target.value
                                            })}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <div className='text-center'>
                                <Button type='submit' className='my-4 rounded px-5 py-2 shadow-lg'>
                                    Tokenize and list house
                                </Button>
                            </div>
                        </Form>
                    </div >
                </Container >
            )}
        </>
    )
}