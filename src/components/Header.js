import { Navbar, Nav, Container } from 'react-bootstrap'

const Header = () => {
    return (
        <Navbar className='border p-6 rounded'>
            <Container className='flex mt-4'>
                <Navbar.Brand href='/'>NFT in Deed</Navbar.Brand>
                <Navbar.Collapse id='navbarSupportedContent'>
                    <Nav className='ms-auto'>
                        <Nav.Item><Nav.Link href='/'>
                            Home
                        </Nav.Link></Nav.Item>
                        <Nav.Item><Nav.Link href='/mint-and-list-house'>
                            Sell a home
                        </Nav.Link></Nav.Item>
                        <Nav.Item><Nav.Link href='/my-houses'>
                            My houses
                        </Nav.Link></Nav.Item>
                        <Nav.Item></Nav.Item><Nav.Link href='/my-listed-houses'>
                            My listed houses
                        </Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default Header;