import { useState, useEffect } from "react";
import { ToastContainer } from 'react-toastify';
import { notify } from '../../utils/notification';
import getWalletConnected from "../../utils/wallet";
import Header from "./Header";
import WalletStatus from "./WalletStatus";
import { Container } from "react-bootstrap";

export default function Layout({ children }) {
    const [walletAddress, setWallet] = useState('');
    const [status, setStatus] = useState('');
    const [metamaskInstalled, setMetamaskInstalled] = useState(false);

    function walletListener() {
        if (ethereum) {
            setMetamaskInstalled(true);

            ethereum.on('accountsChanged', accounts => {
                if (accounts.length > 0) {
                    setWallet(accounts[0]);
                    window.location.reload();
                } else {
                    notify('Wallet', 'Connect to MetaMask using the \'Connect wallet\' button.');
                    window.location.reload();
                }
            });
        } else {
            notify('Wallet', (
                <p>
                    {' '}You must install Metamask, an Ethereum wallet, in your browser.{' '}
                    <Button href='https://metamask.io/download.html' className='my-4 rounded px-3 py-2 shadow-lg'>Download</Button>
                </p>
            ));
        }
    }

    useEffect(() => {
        async function getWallet() {
            const { address, status } = getWalletConnected();
            setWallet(address);
            notify('Wallet', status);
            walletListener();
        }

        getWallet();
    }, []);

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
            <WalletStatus status={status} />
            {children}
            <ToastContainer />
        </Container>
    );
}