import { useState, useEffect, cloneElement } from "react";
import { ToastContainer } from 'react-toastify';
import { notify } from '../../utils/notification';
import getWalletConnected from "../../utils/wallet";
import Header from "./Header/Header";
import WalletStatus from "./WalletStatus";
import { Button, Container } from "react-bootstrap";

export default function Layout({ children }) {
    const [walletAddress, setWallet] = useState('');
    const [status, setStatus] = useState('');
    const [metamaskInstalled, setMetamaskInstalled] = useState(false);

    function walletListener() {
        if (window.ethereum) {
            setMetamaskInstalled(true);

            ethereum.on('accountsChanged', async accounts => {
                if (accounts.length > 0) {
                    setWallet(accounts[0]);
                    window.location.reload();
                } else {
                    notify('Wallet', 'Connect to MetaMask using the \'Connect wallet\' button.');
                    window.location.reload();
                }
            });
        } else {
            setStatus(
                <>
                    <p>
                        {" "}You must install an Ethereum wallet called MetaMask in your browser.{" "}
                        <Button
                            className='mx-3 rounded px-3 py-2 shadow-lg'
                            onClick={
                                () => window.open('https://metamask.io/download.html', '_blank')
                            }
                        >
                            Download
                        </Button>
                    </p>
                    <p><i>Then, select the Goerli test network, NOT the main Ethereum network</i></p>
                </>
            );
        }
    }

    async function getWallet() {
        const { address, status } = getWalletConnected();
        setWallet(address);
        notify('Wallet', status);
        walletListener();
    }

    useEffect(() => { getWallet() }, []);

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