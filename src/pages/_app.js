import Head from 'next/head';
import Layout from '../components/Layout.js';
import Loader from '../components/Loader.js';
import { events } from 'next/router';
import 'bootstrap/dist/css/bootstrap.min.css';
import "react-toastify/dist/ReactToastify.css";
import { useState } from 'react';

export default function Dapp({ Component, pageProps }) {
    const [loading, setLoading] = useState(false);
    events.on('routeChangeStart', (url) => setLoading(true));
    events.on('routeChangeComplete', (url) => setLoading(false));

    return (
        <>
            <Head><title>NFT-in-Deed</title></Head>
            <Layout>
                {
                    loading ?
                        <Loader width={520} height={400} /> :
                        <Component {...pageProps} />
                }
            </Layout>
        </>
    )
}