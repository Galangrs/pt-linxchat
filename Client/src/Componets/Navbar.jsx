import { Link, useNavigate } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Swal from 'sweetalert2';
import { useAuth } from '../Componets/AuthContext';

function NavbarPage() {
    const navigate = useNavigate();
    const { isLoggedIn, logout } = useAuth();

    const handleClearLocalStorage = () => {
        Swal.fire({
            title: 'Successfully logged out!',
            text: 'You have been successfully logged out.',
            icon: 'success',
        });
        localStorage.clear();
        logout()
        navigate('/products');
    };

    return (
        <Navbar expand="lg" className="bg-body-tertiary">
            <Container>
                <Navbar.Brand as={Link} to="/">
                    React-Bootstrap
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link as={Link} to="/products">
                            Products
                        </Nav.Link>
                        {isLoggedIn && (
                            <>
                                <Nav.Link as={Link} to="/addproducts">
                                    Add Product
                                </Nav.Link>
                                <Nav.Link as={Link} to="/cart">
                                    Cart
                                </Nav.Link>
                                <Nav.Link as={Link} to="/chat">
                                    Chat
                                </Nav.Link>
                            </>
                        )}
                    </Nav>
                    <Nav className="ms-auto">
                        {isLoggedIn ? (
                            <>
                                <Nav.Link onClick={handleClearLocalStorage} as="span">
                                    Logout
                                </Nav.Link>
                            </>
                        ) : (
                            <>
                                <Nav.Link as={Link} to="/login">
                                    Login
                                </Nav.Link>
                                <Nav.Link as={Link} to="/register">
                                    Register
                                </Nav.Link>
                            </>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default NavbarPage;
