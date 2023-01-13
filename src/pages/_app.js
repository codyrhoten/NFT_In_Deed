import Head from 'next/head';
import Layout from '../components/Layout.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import "react-toastify/dist/ReactToastify.css";

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