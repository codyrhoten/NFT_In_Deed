import { Button } from 'react-bootstrap';

export default function ConnectButton({ metamaskInstalled, connectWalletPressed, walletAddress }) {
    if (metamaskInstalled) {
        return (
            <Button
                id='walletButton'
                onClick={connectWalletPressed}
                className='me-5'
            >
                {walletAddress ? (
                    'Connected: ' +
                    String(walletAddress).substring(0, 6) +
                    '...' +
                    String(walletAddress).substring(38)
                ) : (
                    <span>Connect Wallet</span>
                )}
            </Button>
        );
    }

};