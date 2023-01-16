import { Navbar, Nav, Container } from 'react-bootstrap'
import Link from 'next/link';
import ConnectButton from './ConnectButton';

export default function Header({ metamaskInstalled, walletButtonPressed, walletAddress }) {
    return (
        <Navbar className='border p-6 rounded mb-4'>
            <Container className='flex mt-3'>
                <Navbar.Brand><Link href='/'><b>NFT-in-Deed</b></Link></Navbar.Brand>
                <Navbar.Collapse id='navbarSupportedContent'>
                    <Nav className='ms-auto'>
                        <Nav.Item><Link styles={{
                            display: 'block',
                            padding: '0.5rem 1rem',
                            color: '#0d6efd',
                            textDecoration: 'none',
                            transition: 'color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out'
                        }} href='/tokenize-and-list-house'>
                            Tokenize & list a home
                        </Link></Nav.Item>
                        <div className="vr" />
                        <Nav.Item><Link href='/my-houses'>
                            My houses
                        </Link></Nav.Item>
                        <div className="vr" />
                        <Nav.Item><Link href='/my-listed-houses'>
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