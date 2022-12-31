import { useState } from 'react';
import { useRouter } from 'next/router'
import { create as ipfsHttpClient } from 'ipfs-http-client'
import { ethers } from 'ethers';
const Marketplace = require('../../artifacts/contracts/Market.sol/Market.json');
const HouseNFT = require('../../artifacts/contracts/HouseNFT.sol/HouseNFT.json');
import { houseNftAddress, marketAddress } from '../../config';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';

const projectSecret = process.env["IPFS_KEY_SECRET"];
const projectId = process.env["IPFS_PROJECT_ID"];
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
            imageURL,
            bedrooms,
            bathrooms,
            houseSqFt,
            lotSqFt,
            yearBuilt
        } = formInput;

        if (
            !priceInEth ||
            !address ||
            !imageURL ||
            !bedrooms ||
            !bathrooms ||
            !houseSqFt ||
            !lotSqFt ||
            !yearBuilt
        ) {
            return;
        } else {
            // upload metadata to IPFS
            const data = JSON.stringify({
                priceInEth,
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

    async function mintAndListHouse() {
        const provider = new ethers.providers.Web3Provider(window.Ethereum);
        const url = await uploadToIPFS();
        const signer = provider.getSigner();

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
        console.log(listingFee);

        const listTx = await marketContract.listHouse(
            houseNftAddress,
            mintedHouseId,
            priceInWei,
            { value: listingFee }
        );
        console.log('listed house tx: ', listTx.hash);
        router.push('/');
    }

    function getBedroomOptions() {
        let bedrooms = [];

        for (let i = 1; i <= 8; i++) {
            bedrooms.push(<option>{i.toString()}</option>);
        }

        return bedrooms;
    }

    function getBathroomOptions() {
        let bathrooms = [];

        for (let i = 2; i <= 12; i++) {
            const option = (i / 2).toString();
            bathrooms.push(<option>{option}</option>);
        }

        return bathrooms;
    }

    return (
        <Container className="flex justify-center">
            <div className="w-1/2 flex flex-col pb-12">
                <h2 className="text-2xl py-2 text-center bg-gray-100 rounded ">
                    List your house
                </h2>
                <Form>
                    <Row className='align-items-center'>
                        <Col sm={9}>
                            <Form.Control
                                placeholder='street name, apt/suite/floor, city, state, zip code'
                                className='mt-8 border rounded p-4'
                                value={formInput.address ? formInput.address : ''}
                                onChange={e => updateFormInput({
                                    ...formInput,
                                    address: e.target.value
                                })}
                            />
                        </Col>
                        <Col sm={3}>
                            <Form.Control
                                placeholder='price in ETH'
                                className='mt-8 border rounded p-4'
                                value={formInput.priceInEth ? formInput.priceInEth : ''}
                                onChange={e => updateFormInput({
                                    ...formInput,
                                    priceInEth: e.target.value
                                })}
                            />
                        </Col>
                    </Row>
                    <Form.Control
                        type="file"
                        name="House"
                        className="my-4"
                        onChange={onChange}
                    />
                    {fileUrl && <img className="rounded mt-4" width="350" src={fileUrl} />}
                    <Row>
                        <Form.Select
                            as={Col}
                            defaultValue='bedrooms'
                            className='mt-8 border rounded p-4'
                        >
                            {getBedroomOptions()}
                        </Form.Select>
                        <Form.Select
                            as={Col}
                            defaultValue='bathrooms'
                            className='mt-8 border rounded p-4'
                        >
                            {getBathroomOptions()}
                        </Form.Select>
                    </Row>
                    <Row>
                        <Form.Control
                            as={Col}
                            placeholder='house sq ft (number)'
                            className='mt-8 border rounded p-4'
                            value={formInput.houseSqFt ? formInput.houseSqFt : ''}
                            onChange={e => updateFormInput({
                                ...formInput,
                                houseSqFt: e.target.value
                            })}
                        />
                        <Form.Control
                            as={Col}
                            placeholder='lot sq ft (number)'
                            className='mt-8 border rounded p-4'
                            value={formInput.lotSqFt ? formInput.lotSqFt : ''}
                            onChange={e => updateFormInput({
                                ...formInput,
                                lotSqFt: e.target.value
                            })}
                        />
                        <Form.Control
                            as={Col}
                            placeholder='year built'
                            className='mt-8 border rounded p-4'
                            value={formInput.yearBuilt ? formInput.yearBuilt : ''}
                            onChange={e => updateFormInput({
                                ...formInput,
                                yearBuilt: e.target.value
                            })}
                        />
                    </Row>
                    <Button 
                        type='submit' 
                        className='font-bold mt-4 bg-teal-400 text-white rounded p-4 shadow-lg'
                        onClick={mintAndListHouse}
                    >
                        Mint and list house
                    </Button>
                </Form>
            </div>
        </Container>
    )
}