// import Image from 'next/image';
import { Modal } from "react-bootstrap";

export default function TxModal({ show, handleClose, index, houseResale, tokenize }) {
    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header>
                <Modal.Title>
                    {
                        (() => {
                            if (index) {
                                return 'Buy this house';
                            } else if (houseResale) {
                                return 'List this house';
                            } else {
                                return 'Tokenize this house';
                            }
                        })()
                    }
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {/* STEP 1 */}
                <p className='p-4 my-2'>
                    <b>Step 1: </b>{
                        (() => {
                            if (index) {
                                return 'Purchase house NFT from the seller by confirming the transaction on your wallet.';
                            } else if (houseResale) {
                                return 'Give approval to the Market to receive and later sell the deed by confirming the transaction in your wallet.'
                            } else {
                                return 'Tokenize the house NFT and store it on the blockchain by confirming the transaction in your wallet.';
                            }
                        })()
                    }
                </p>
                {/* STEP 2 */}
                <p className='p-4 my-2'>
                    <b>Step 2:</b> Wait for a few seconds for the transaction to be processed.
                </p>
                {/* STEPS 3 - 4 */}
                {
                    houseResale || tokenize ? (
                        <>
                            <p className='p-4 my-2'>
                                <b>Step 3:</b> Now for the listing transaction: this comes with a 3% listing fee. Confirm the transaction in your wallet.
                            </p>
                            <p className='p-4 my-2'>
                                <b>Step 4:</b> Wait another few seconds for the transaction to be processed. Then your house will be on the NFT-in-Deed Market for sale!
                            </p>
                        </>
                    ) : null
                }
            </Modal.Body>
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
        </Modal>
    );
}