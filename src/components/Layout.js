import { useState, useEffect, cloneElement } from "react";
import { ToastContainer } from 'react-toastify';
import { notify } from '../../utils/notification';
import getWalletConnected from "../../utils/wallet";
import Header from "./Header/Header";
import WalletStatus from "./WalletStatus";
import { Button, Container, Modal } from "react-bootstrap";

export default function Layout({ children }) {
    const [walletAddress, setWallet] = useState('');
    const [status, setStatus] = useState('');
    const [metamaskInstalled, setMetamaskInstalled] = useState(false);
    const [show, setShow] = useState(true);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    console.log(show);

    useEffect(() => { 
        getWallet() ;
    }, 
    [metamaskInstalled]);

    function walletListener() {
        if (window.ethereum) {
            setMetamaskInstalled(true);

            if (show) {
                handleClose();
            }

            ethereum.on('accountsChanged', async accounts => {
                if (accounts.length > 0) {
                    setWallet(accounts[0]);
                    window.location.reload();
                } else {
                    notify('Wallet', 'Connect to MetaMask using the \'Connect Wallet\' button.');
                    window.location.reload();
                }
            });
        } else {
            setStatus(
                <div style={{ marginTop: '150px' }}>
                    <Modal show={show} centered>
                        <Modal.Body>
                            <p>
                                {" "}To use this marketplace, MetaMask must be installed in your browser. Click the button to see which browsers are supported.{" "}
                            </p>
                            <div className="text-center">
                                <Button
                                    className='mx-3 my-3 rounded px-3 py-2 shadow-lg'
                                    onClick={
                                        () => window.open('https://metamask.io/download.html', '_blank')
                                    }
                                >
                                    Get MetaMask
                                </Button>
                                <p><i>Then, select the Goerli test network.</i></p>
                            </div>
                        </Modal.Body>
                    </Modal>
                </div>
            );
        }
    }

    async function getWallet() {
        const { address, status } = getWalletConnected();
        setWallet(address);
        notify('Wallet', status);
        walletListener();
        console.log(show);
    }

    async function walletButtonPressed() {
        const walletResponse = await getWalletConnected();
        notify('Wallet', walletResponse.status);
        setWallet(walletResponse.address);
    }

    return (
        <Container>
            <Header
                metamaskInstalled={metamaskInstalled}
                getWalletConnected={getWalletConnected}
                walletAddress={walletAddress}
                walletButtonPressed={walletButtonPressed}
            />
            {!metamaskInstalled ? <WalletStatus status={status} /> : children}
            <ToastContainer />
        </Container>
    );
}