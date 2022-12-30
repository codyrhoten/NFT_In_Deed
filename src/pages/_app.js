import Head from 'next/head';
import Layout from '../components/Layout';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function Dapp({ Component, pageProps }) {
    return (
        <>
            <Head><title>NFT in Deed</title></Head>
            <Layout>
                <Component {...pageProps} />
            </Layout>
        </>
    )
}