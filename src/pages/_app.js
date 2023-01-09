import Head from 'next/head';
import 'bootstrap/dist/css/bootstrap.min.css';
import Layout from '../components/Layout.js';

export default function Dapp({ Component, pageProps }) {
    return (
        <>
            <Head><title>NFT-in-Deed</title></Head>
            <Layout>
                <Component {...pageProps} />
            </Layout>
        </>
    )
}