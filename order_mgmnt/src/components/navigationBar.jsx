import React from 'react';
import { Container, Navbar, Nav, Dropdown, Image } from 'react-bootstrap';
import { FaUserCircle } from 'react-icons/fa'; // Profile Icon
import logo from '../Images/logo.png';

const NavigationBar = () => {
  const user = JSON.parse(localStorage.getItem('user')); // Get user from localStorage

  const handleLogout = () => {
    localStorage.removeItem('user'); // Clear user data
    window.location.href = '/'; // Redirect to login page or home
  };

  const handleChangePassword = () => {
    window.location.href = '/change-password'; // Redirect to change password page
  };

  return (
    <Container fluid>
      <Navbar className='header fixed-top' bg="light" expand="lg">
        <Navbar.Brand href={user ? "/home" : "#"} className="mx-3">
          <img
            src={logo}
            width="70"
            height="50"
            className="d-inline-block align-top"
            alt="Company Logo"
          />
        </Navbar.Brand>

        {user ? (
          <>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="ms-auto">

                {/* Conditional rendering for specific user */}
                {user.email.toLowerCase() !== "bob@tssprinting.com" && (
                  <>
                    <Nav.Link href="/embroidory">Embroidery</Nav.Link>
                    <Nav.Link href="/dtg">DTG</Nav.Link>
                    <Nav.Link href="/dtgEmd">DTG+EMB</Nav.Link>
                    <Nav.Link href="/spEmd">SP+EMB</Nav.Link>
                    <Nav.Link href="/screenprinting">Screen Printing</Nav.Link>
                  </>
                )}

                {/* Profile Dropdown with Name */}
                <Dropdown align="end" className="mx-3">
                  <Dropdown.Toggle variant="light" id="dropdown-profile" className="d-flex align-items-center">
                    {/* Profile Icon */}
                    <FaUserCircle size={35} className="me-2" /> 
                    <div className="d-flex flex-column align-items-start">
                      <strong>{user.name}</strong> {/* Display user name */}
                      <small>{user.email}</small> {/* Display user email below */}
                    </div>
                  </Dropdown.Toggle>

                  <Dropdown.Menu>
                    <Dropdown.Item onClick={handleChangePassword}>
                      Change Password
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={handleLogout}>
                      Logout
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>

              </Nav>
            </Navbar.Collapse>
          </>
        ) : (
          <>
            {/* Optional content for non-logged-in users */}
          </>
        )}
      </Navbar>
    </Container>
  );
};

export default NavigationBar;
