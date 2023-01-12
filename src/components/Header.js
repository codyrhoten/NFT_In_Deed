import { Navbar, Nav, Container } from 'react-bootstrap'
import ConnectButton from './ConnectButton';

export default function Header({ metamaskInstalled, walletButtonPressed, walletAddress }) {
    return (
        <Navbar className='border p-6 rounded mb-4'>
            <Container className='flex mt-4'>
                <Navbar.Brand href='/'><b>NFT-in-Deed</b></Navbar.Brand>
                <Navbar.Collapse id='navbarSupportedContent'>
                    <Nav className='ms-auto'>
                        <Nav.Item><Nav.Link href='/tokenize-and-list-house'>
                            Tokenize & list a home
                        </Nav.Link></Nav.Item>
                        <Nav.Item><Nav.Link href='/my-houses'>
                            My houses
                        </Nav.Link></Nav.Item>
                        <Nav.Item><Nav.Link href='/my-listed-houses'>
                            My listed houses
                        </Nav.Link></Nav.Item>
                        <Nav.Item>
                            <ConnectButton
                                metamaskInstalled={metamaskInstalled}
                                connectWalletPressed={walletButtonPressed}
                                walletAddress={walletAddress}
                            ></ConnectButton>
                        </Nav.Item>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}