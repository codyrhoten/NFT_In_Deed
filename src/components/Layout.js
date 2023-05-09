import { useState, useEffect, cloneElement } from "react";
import { ToastContainer } from 'react-toastify';
import { notify } from '../../utils/notification';
import getWalletConnected from "../../utils/wallet";
import Header from "./Header/Header";
import WalletStatus from "./WalletStatus";
import { Button, Container, Modal } from "react-bootstrap";

export default function Layout({ children }) {
    const [walletAddress, setWallet] = useState('');
    const [network, setNetwork] = useState('');
    const [status, setStatus] = useState('');
    const [metamaskInstalled, setMetamaskInstalled] = useState(false);
    const [show, setShow] = useState(true);
    const handleClose = () => setShow(false);

    useEffect(() => {
        getWallet();
    },
        [metamaskInstalled, network]);

    async function walletListener() {
        if (window.ethereum) {
            setMetamaskInstalled(true);
            const chain = await getChain();
            setNetwork(chain);

            if (network !== 'Goerli') {
                setStatus(
                    <Modal show={show} centered>
                        <Modal.Body>
                            <p className='p-3'>
                                In your MetaMask wallet, switch to the Goerli Test Network. You may have to turn on "show test networks" in your MetaMask settings.
                            </p>
                        </Modal.Body>
                    </Modal>
                );
            }

            ethereum.on('chainChanged', async () => {
                window.location.reload();
            });

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
                            <p className='p-3'>
                                {" "}To use this marketplace, MetaMask must be installed in your browser. Click the button to see which browsers are supported.{" "}
                            </p>
                            <div className="text-center">
                                <Button
                                    className='rounded mb-3 px-3 py-2 shadow-lg'
                                    onClick={
                                        () => window.open('https://metamask.io/download.html', '_blank')
                                    }
                                >
                                    Get MetaMask
                                </Button>
                            </div>
                        </Modal.Body>
                    </Modal>
                </div>
            );
        }
    }

    async function getChain() {
        if (window.ethereum) {
            let chain = await ethereum.networkVersion;

            if (chain === '5') {
                chain = 'Goerli';
            }

            return chain;
        }
    }

    async function getWallet() {
        const { address, status } = getWalletConnected();
        setWallet(address);
        notify('Wallet', status);
        walletListener();
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
            {!metamaskInstalled || network !== 'Goerli' ? <WalletStatus status={status} /> : children}
            <ToastContainer />
        </Container>
    );
}