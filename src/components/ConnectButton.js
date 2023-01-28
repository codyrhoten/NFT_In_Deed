import { Button } from 'react-bootstrap';

export default function ConnectButton({ metamaskInstalled, connectWalletPressed, walletAddress }) {
    return (
        <div>
            {metamaskInstalled && (
                <Button
                    id="walletButton"
                    onClick={connectWalletPressed}
                >
                    {walletAddress ? (
                        "Connected: " +
                        String(walletAddress).substring(0, 6) +
                        "..." +
                        String(walletAddress).substring(38)
                    ) : (
                        <span>Connect wallet in Goerli test network</span>
                    )}
                </Button>
            )}
        </div>
    );
};