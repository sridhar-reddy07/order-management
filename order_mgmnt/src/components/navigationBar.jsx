import React, { useState } from 'react';
import { Container, Navbar, Nav, Dropdown, Modal, Button, Form } from 'react-bootstrap';
import { FaUserCircle } from 'react-icons/fa'; // Profile Icon
import logo from '../Images/logo.png';
import axios from 'axios'; // You can use axios or fetch for API requests

const NavigationBar = () => {
  const user = JSON.parse(localStorage.getItem('user')); // Get user from localStorage
  const [showChangePassword, setShowChangePassword] = useState(false); // Modal state
  const [newPassword, setNewPassword] = useState(""); // State to hold new password
  const [confirmPassword, setConfirmPassword] = useState(""); // State to confirm password
  const [error, setError] = useState(""); // State for errors

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('user'); // Clear user data
    window.location.href = '/'; // Redirect to login page or home
  };

  // Handle change password modal
  const handleShowChangePassword = () => setShowChangePassword(true);
  const handleCloseChangePassword = () => {
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    setShowChangePassword(false);
  };

  // Handle change password submission
  const handleSubmitChangePassword = async () => {
    
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    
    try {
      // Make an API request to change the password
      const response = await axios.post('http://137.184.75.176:5000/change-password', {
        email: user.email,
        newPassword: newPassword
      });
      console.log(response)

      if (response.data.success) {
        alert('Password changed successfully.');
        handleCloseChangePassword(); // Close modal on success
      } else {
        setError('Failed to change password.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred.');
    }
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
                    <Dropdown.Item onClick={handleShowChangePassword}>
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

        {/* Modal for Changing Password */}
        <Modal show={showChangePassword} onHide={handleCloseChangePassword}>
          <Modal.Header closeButton>
            <Modal.Title>Change Password</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group controlId="formNewPassword">
                <Form.Label>New Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </Form.Group>

              <Form.Group controlId="formConfirmPassword" className="mt-3">
                <Form.Label>Confirm Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </Form.Group>

              {error && <p className="text-danger mt-3">{error}</p>}
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseChangePassword}>
              Close
            </Button>
            <Button variant="primary" onClick={handleSubmitChangePassword}>
              Change Password
            </Button>
          </Modal.Footer>
        </Modal>

      </Navbar>
    </Container>
  );
};

export default NavigationBar;
