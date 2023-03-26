import { Navbar, Nav } from 'react-bootstrap'
import Link from 'next/link';
import styles from './Header.module.css';
import ConnectButton from '../ConnectButton';

export default function Header({ metamaskInstalled, walletButtonPressed, walletAddress }) {
    return (
        <Navbar fixed='top' style={{ backgroundColor: 'white', borderBottom: '1px solid black' }}>
            <Navbar.Brand>
                <Link className={styles.navBrand} href='/'>
                    <b>NFT-in-Deed</b>
                </Link>
            </Navbar.Brand>
            <Navbar.Collapse id='navbarSupportedContent'>
                <Nav className='ms-auto mx-3'>
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
            <ConnectButton
                metamaskInstalled={metamaskInstalled}
                connectWalletPressed={walletButtonPressed}
                walletAddress={walletAddress}
            />
        </Navbar >
    );
}