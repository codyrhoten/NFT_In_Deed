import { Button } from 'react-bootstrap';

export default async function getWalletConnected() {
    if (window.ethereum) {
        try {
            const addresses = await ethereum.request({ method: "eth_requestAccounts" });

            if (addresses.length > 0) {
                return {
                    address: addresses[0],
                    status: 'Wallet loaded'
                };
            } else {
                return { address: '', status: 'No wallet loaded' };
            }
        } catch (err) {
            return { address: '', status: err.message };
        }
    } else {
        return {
            address: '',
            status: (
                <p>
                    {" "}You must install an Ethereum wallet called MetaMask in your browser.{" "}
                    <Button 
                        className='mx-3 rounded px-3 py-2 shadow-lg'
                        onClick={() => window.open('https://metamask.io/download.html', '_blank')}
                    >
                        Download
                    </Button>
                </p>
            )
        }
    }
};