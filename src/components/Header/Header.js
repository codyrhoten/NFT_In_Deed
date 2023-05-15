import { Navbar, Nav } from 'react-bootstrap'
import Link from 'next/link';
import styles from './Header.module.css';
import { Button } from 'react-bootstrap';

export default function Header({ metamaskInstalled, walletButtonPressed, walletAddress }) {
    return (
        <Navbar fixed='top' style={{ backgroundColor: '#1e1e1e' }}>
            <Navbar.Brand>
                <Link className={styles.navBrand} href='/'>
                    <b>NFT In-deed</b>
                </Link>
            </Navbar.Brand>
            <Navbar.Collapse id='navbarSupportedContent'>
                <Nav className='ms-auto mx-3'>
                    <Nav.Item><Link className={styles._link} href='/tokenize-and-list-house'>
                        Tokenize/List
                    </Link></Nav.Item>
                    <div className="vr vr-blurry mx-1" style={{ color: 'white' }} />
                    <Nav.Item><Link className={styles._link} href='/my-houses'>
                        Purchased
                    </Link></Nav.Item>
                    <div className="vr vr-blurry mx-1" style={{ color: 'white' }} />
                    <Nav.Item><Link className={styles._link} href='/my-listed-houses'>
                        Listed
                    </Link></Nav.Item>
                </Nav>
            </Navbar.Collapse>
            {
                metamaskInstalled && (
                    <Button
                        id='walletButton'
                        onClick={walletButtonPressed}
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
                )
            }
        </Navbar >
    );
}