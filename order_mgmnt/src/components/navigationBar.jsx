import React from 'react';
import { Container, Navbar, Nav } from 'react-bootstrap';
import logo from '../Images/logo.png';

const NavigationBar = () => {
  const user = JSON.parse(localStorage.getItem('user')); // Get user from localStorage

  const handleLogout = () => {
    localStorage.removeItem('user'); // Clear user data
    window.location.href = '/'; // Redirect to login page or home
  };

  return (
    <Container fluid>
      <Navbar className='header fixed-top' bg="light" expand="lg">
        <Navbar.Brand href={user ? "/home" : "#"}className="mx-3">
          <img
            src={logo}
            width="70"
            height="50"
            className="d-inline-block align-top"
            alt="Company Logo"
          />
        </Navbar.Brand>

        {/* Conditional Rendering */}
        {user ? (
          <>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="ms-auto">
                <Nav.Link href="/embroidory">
                  Embroidery
                </Nav.Link>
                <Nav.Link href="/dtg">
                  DTG
                </Nav.Link>
                <Nav.Link href="/dtgEmd">
                  DTG+EMB
                </Nav.Link>
                <Nav.Link href="/screenprinting">
                  Screen Printing
                </Nav.Link>
                <Nav.Link href="#" onClick={handleLogout}>
                  Logout
                </Nav.Link>
              </Nav>
            </Navbar.Collapse>
          </>
        ) : (
          <>
            {/* Add any additional content for non-logged-in users here if needed */}
          </>
        )}
      </Navbar>
    </Container>
  );
};

export default NavigationBar;
