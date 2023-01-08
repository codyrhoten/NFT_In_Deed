import Link from "next/link";
import { Button } from "react-bootstrap";

export const getNetworkName = async () => {
    if (ethereum) {
        let chainId = await ethereum.networkVersion;
        if (chainId !== '31337') {
            return 'Wrong network'
            alert('change network to local hardhat');
        }

        return 'Local host';
    }
};

export const getWalletConnected = async () => {
    if (ethereum) {
        try {
            const addresses = await ethereum.request({ method: "eth_accounts" });

            if (addresses.length > 0) {
                return {
                    address: addresses[0],
                };
            } else {
                return 'Connect to Metamask.';
            }
        } catch (err) {
            return err.message;
        }
    } else {
        return (
            <p>
                {" "}You must install Metamask, an Ethereum wallet, in your browser.{" "}
                <Button href='https://metamask.io/download.html' className='my-4 rounded px-3 py-2 shadow-lg'>Download</Button>
            </p>
        );
    }
};