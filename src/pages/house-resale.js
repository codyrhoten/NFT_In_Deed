import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from 'axios';
import Web3Modal from 'web3modal';
import { ethers } from 'ethers';
const Marketplace = require('../../artifacts/contracts/Market.sol/Market.json');
import { houseNftAddress, marketAddress } from '../../config';
import { ToastContainer, toast } from 'react-toastify';
import { notify, update } from '../../utils/notification';
import Transacting from '../components/Transacting';
import { Button, Container, Form } from 'react-bootstrap';

export default function HouseResale() {
    const [formInput, updateFormInput] = useState({ priceInEth: '', image: '', });
    const [error, setError] = useState('');
    const [isTransacting, setIsTransacting] = useState(false);
    const { image, priceInEth, } = formInput;
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

        if (!priceInEth) {
            setError('Must set a price in order to list');
        } else {
            const web3Modal = new Web3Modal();
            const connection = await web3Modal.connect();
            const provider = new ethers.providers.Web3Provider(connection);
            const signer = provider.getSigner();

            try {
                setIsTransacting(true);
                const marketContract = new ethers.Contract(marketAddress, Marketplace.abi, signer);
                const priceInWei = ethers.utils.parseUnits(formInput.priceInEth, 'ether');
                let listingFee = await marketContract.getListingFee(priceInWei);
                listingFee = listingFee.toString();
                notify('Market', 'Listing new NFT-in-Deed ...');

                const listing = await marketContract.listHouse(
                    houseNftAddress,
                    id,
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
                    setError('The transaction was rejected.')
                }

                toast.error(err.message.split(':')[1]);
            }
        }
    }

    return (
        <>
            <ToastContainer position='top-right' />
            {isTransacting ? (
                <Transacting />
            ) : (
                <Container className="flex justify-center">
                    <div className="w-1/2 flex flex-col pb-12">
                        <h2 className="text-2xl mt-4 text-center bg-gray-100 rounded ">
                            List your house
                        </h2>
                        <Form className='justify-content-md-center' onSubmit={listHouse}>
                            {error && <p className='text-center text-danger mt-5'>{error}</p>}
                            <Form.Control
                                placeholder='price in ETH'
                                className={error ?
                                    'mt-1 border rounded mx-auto' :
                                    'mt-5 border rounded mx-auto'
                                }
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