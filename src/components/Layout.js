import { useState, useEffect, cloneElement } from "react";
import { chains } from "../../utils/chains.js";
import { ToastContainer } from 'react-toastify';
import { notify } from '../../utils/notification';
import getWalletConnected from "../../utils/wallet";
import Header from "./Header/Header";
import WalletStatus from "./WalletStatus";
import { Container, Modal } from "react-bootstrap";

export default function Layout({ children }) {
    const [walletAddress, setWallet] = useState('');
    const [network, setNetwork] = useState('');
    const [status, setStatus] = useState('');
    const [metamaskInstalled, setMetamaskInstalled] = useState(false);
    const [show, setShow] = useState(true);
    const handleClose = () => setShow(false);

    useEffect(
        async () => {
            const chain = await getChain();
            setNetwork(chain);
            getWallet();
        },
        []
    );

    async function walletListener() {
        if (window.ethereum) {
            setMetamaskInstalled(true);
            console.log(network);

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
                                <button
                                    className='rounded my-3 px-4 py-3 shadow w-100'
                                    onClick={() => window.open('https://metamask.io/download.html', '_blank')}
                                    style={{
                                        textDecoration: 'none',
                                        color: 'white',
                                        backgroundColor: '#1e1e1e',
                                        border: '0px'
                                    }}>
                                    Get MetaMask
                                </button>
                            </div>
                        </Modal.Body>
                    </Modal>
                </div>
            );
        }
    }

    async function getChain() {
        if (window.ethereum) {
            let chain = await ethereum.request({ method: 'eth_chainId' });

            if (chain === '0x5') {
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