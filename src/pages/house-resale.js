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
import { Button, Container, Form, Modal } from 'react-bootstrap';
import TxModal from '../components/TxModal';

export default function HouseResale() {
    const [show, setShow] = useState(false);
    const [formInput, updateFormInput] = useState({ priceInEth: '', image: '', });
    // const [isLoading, setLoadingState] = useState(false);
    const { image } = formInput;
    const router = useRouter();
    const { id, houseURI } = router.query;
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

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
            handleShow();

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
            handleClose();

            router.push('/');
        } catch (err) {
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
            handleClose();
        }
    }

    return (
        <>
            <TxModal show={show} handleClose={handleClose} houseResale={true} />
            <Container className='flex justify-center' style={{ marginTop: '100px' }}>
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
        </>
    );
}