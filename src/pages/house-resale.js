import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Web3Modal from 'web3modal';
import { ethers } from 'ethers';
const HouseNFT = require('../../artifacts/contracts/HouseNFT.sol/HouseNFT.json');
const Marketplace = require('../../artifacts/contracts/Market.sol/Market.json');
import { houseNftAddress, marketAddress } from '../../config';
import { toast } from 'react-toastify';
import { notify, update } from '../../utils/notification';
import { Button, Container, Form } from 'react-bootstrap';

export default function HouseResale() {
    const [formInput, updateFormInput] = useState({ priceInEth: '', image: '', });
    const [isTransacting, setIsTransacting] = useState(false);
    // const [isLoading, setLoadingState] = useState(false);
    const { image } = formInput;
    const router = useRouter();
    const { id, houseURI } = router.query;

    async function getHouse() {
        if (!houseURI) {
            return;
        } else {
            const meta = await axios.get(houseURI);
            updateFormInput(state => ({ ...state, image: meta.data.imageURL }));
        }
    }

    useEffect(() => { getHouse() }, [id]);

    async function listHouse(e) {
        e.preventDefault();

        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();
        const houseNFTContract = new ethers.Contract(houseNftAddress, HouseNFT.abi, signer);
        const marketContract = new ethers.Contract(marketAddress, Marketplace.abi, signer);
        const priceInWei = ethers.utils.parseUnits(formInput.priceInEth, 'ether');

        try {
            setIsTransacting(true);

            const userApproval = await houseNFTContract.setApprovalForAll(
                marketAddress,
                true
            );
            notify('Approval', 'Setting approval for Market give your NFT to you');
            userApproval.wait();
            update('Approval', 'Approval successful!');

            let listingFee = await marketContract.getListingFee(priceInWei);
            listingFee = listingFee.toString();

            const listing = await marketContract.listHouse(
                houseNftAddress,
                id,
                priceInWei,
                { value: listingFee }
            );

            // setLoadingState(true);
            notify('Market', 'Listing new NFT-in-Deed ...');
            listing.wait();

            // setLoadingState(false);
            update('Market', 'NFT-in-Deed successfully listed!');
            setIsTransacting(false);

            router.push('/');
        } catch (err) {
            console.log(err.message);
            let errorMessage = '';

            if (err.message.includes('insufficient funds')) {
                errorMessage =
                    'Insufficient funds to cover the listing fee. Add more funds to your wallet to try again.';
            }

            if (err.message.includes("user rejected")) {
                errorMessage =
                    "Transaction was rejected by the user. Try again?";
            }

            toast.error(errorMessage);
            setIsTransacting(false);
        }
    }

    return (
        <>
            {isTransacting ? (
                <div className='flex justify-center mt-10'>
                    <div className='flex flex-col pb-12'>
                        <h2 className='py-2 text-center'>Tokenization/Listing Process</h2>
                        <p className='p-4 my-3'>
                            <b>Step 1:</b> Give approval to the Market to receive and later sell the deed. Confirm the transaction in your wallet.
                        </p>
                        <p className='p-4 my-3'>
                            <b>Step 2:</b> Wait for a few seconds for the transaction to be processed.
                        </p>
                        <p className='p-4 my-3'>
                            <b>Step 3:</b> Now for the listing transaction: this comes with a 3% listing fee. Confirm the transaction in your wallet.
                        </p>
                        <p className='pt-1 p-4 my-3'>
                            <b>Step 4:</b> Wait another few seconds for the transaction to be processed. Then your house will be up on the NFT-in-Deed Market for sale again!
                        </p>
                        {/* {isLoading && (
                        <div className='flex justify-center'>
                            <Image
                                src={'/loading-spinner.gif'}
                                alt='loading spinner'
                                width='175'
                                height='175'
                            />
                        </div>
                    )} */}
                    </div>
                </div>
            ) : (
                <Container className='flex justify-center'>
                    <div className='w-1/2 flex flex-col pb-12'>
                        <h2 className='text-2xl mt-4 text-center bg-gray-100 rounded'>
                            List your house
                        </h2>
                        <Form className='justify-content-md-center' onSubmit={listHouse}>
                            <Form.Control
                                require
                                type='number'
                                placeholder='price in ETH'
                                className='border rounded mx-auto'
                                value={formInput.priceInEth ? formInput.priceInEth : ''}
                                onChange={e => updateFormInput({
                                    ...formInput,
                                    priceInEth: e.target.value
                                })}
                            />
                            {image && (
                                <div className='mt-4 text-center'>
                                    <img
                                        className='rounded mx-auto'
                                        width='400'
                                        src={image}
                                    />
                                </div>
                            )}
                            <div className='text-center'>
                                <Button type='submit' className='my-4 rounded px-5 py-2 shadow-lg'>
                                    Resell house
                                </Button>
                            </div>
                        </Form>
                    </div>
                </Container>
            )}
        </>
    );
}