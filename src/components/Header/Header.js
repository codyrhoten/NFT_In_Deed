import { Navbar, Nav, Container } from 'react-bootstrap'
import Link from 'next/link';
import styles from './Header.module.css';
import ConnectButton from '../ConnectButton';

export default function Header({ metamaskInstalled, walletButtonPressed, walletAddress }) {
    return (
        <Navbar className='border p-6 rounded mb-4'>
            <Container className='flex mt-3'>
                <Navbar.Brand>
                    <Link className={styles._link} href='/'>
                        <b>NFT-in-Deed</b>
                    </Link>
                </Navbar.Brand>
                <Navbar.Collapse id='navbarSupportedContent'>
                    <Nav className='ms-auto'>
                        <Nav.Item><Link className={styles._link} href='/tokenize-and-list-house'>
                            Tokenize & list a home
                        </Link></Nav.Item>
                        <div className="vr" />
                        <Nav.Item><Link className={styles._link} href='/my-houses'>
                            My houses
                        </Link></Nav.Item>
                        <div className="vr" />
                        <Nav.Item><Link className={styles._link} href='/my-listed-houses'>
                            My listed houses
                        </Link></Nav.Item>
                    </Nav>
                </Navbar.Collapse>
                <div className='mx-2'>
                <ConnectButton
                    metamaskInstalled={metamaskInstalled}
                    connectWalletPressed={walletButtonPressed}
                    walletAddress={walletAddress}
                />
            </div>
        </Container>
        </Navbar >
    );
}