import { useState } from 'react';
import { useRouter } from 'next/router'
import { create as ipfsHttpClient } from 'ipfs-http-client'
import Web3Modal from 'web3modal';
import { ethers } from 'ethers';
const Marketplace = require('../../artifacts/contracts/Market.sol/Market.json');
const HouseNFT = require('../../artifacts/contracts/HouseNFT.sol/HouseNFT.json');
import { houseNftAddress, marketAddress } from '../../config';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';

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
    const [fileUrl, setFileUrl] = useState(null)
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
    const [error, setError] = useState('');
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
            console.log('Error uploading file: ', err);
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
            } catch (error) {
                console.log('Error uploading file: ', error);
            }
        }
    }

    async function mintAndListHouse(e) {
        e.preventDefault();

        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);
        const url = await uploadToIPFS();
        const signer = provider.getSigner();


        console.log(provider, ethereum.networkVersion, signer)
        try {
            // Mint a house
            const houseNFTContract = new ethers.Contract(houseNftAddress, HouseNFT.abi, signer);
            const marketContract = new ethers.Contract(marketAddress, Marketplace.abi, signer);

            let mintedHouse = await houseNFTContract.mint(url);
            let mintTx = await mintedHouse.wait();
            let mintEvent = mintTx.events[0];
            let mintedHouseId = mintEvent.args[2];
            console.log('minted house ', mintedHouseId);

            // List the house
            let priceInWei = ethers.utils.parseUnits(formInput.priceInEth, 'ether');
            let listingFee = await marketContract.getListingFee(priceInWei);
            listingFee = listingFee.toString();
            console.log(priceInWei, listingFee);

            await marketContract.listHouse(
                houseNftAddress,
                mintedHouseId,
                priceInWei,
                { value: listingFee }
            );
            router.push('/');
        } catch (err) {
            console.log(err.message);
            if (err.message.includes('user rejected transaction')) {
                setError('The transaction was rejected.')
            }
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
        <Container className="flex justify-center">
            <div className="w-1/2 flex flex-col pb-12">
                <h2 className="text-2xl mt-4 text-center bg-gray-100 rounded ">
                    List your house
                </h2>
                <Form onSubmit={mintAndListHouse}>
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
                            className='border rounded p-2'
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
                        className="mt-2"
                        onChange={onChange}
                    />
                    {fileUrl && <img className="rounded mt-4" width="350" src={fileUrl} />}
                    <Row className='mt-4'>
                        <Col sm={1}>
                            <Form.Group>
                                <Form.Label>Bedrooms</Form.Label>
                                <Form.Select
                                    defaultValue='bedrooms'
                                    className='border rounded p-2'
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
                                    defaultValue='bathrooms'
                                    className='border rounded p-2'
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
                                    placeholder='1250'
                                    className='p-2'
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
                                    className='p-2'
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
                                    className='p-2'
                                    value={formInput.yearBuilt ? formInput.yearBuilt : ''}
                                    onChange={e => updateFormInput({
                                        ...formInput,
                                        yearBuilt: e.target.value
                                    })}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Button
                        type='submit'
                        className='my-4 rounded px-3 py-2 shadow-lg'
                    >
                        Mint and list house
                    </Button>
                </Form>
            </div>
        </Container>
    )
}