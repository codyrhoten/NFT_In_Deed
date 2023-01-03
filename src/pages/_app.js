import Head from 'next/head';
import Header from '../components/Header.js';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function Dapp({ Component, pageProps }) {
    return (
        <>
            <Head><title>NFT in Deed</title></Head>
            <Header />
            <Component {...pageProps} />
        </>
    )
}