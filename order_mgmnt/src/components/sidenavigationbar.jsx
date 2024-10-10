import React from 'react';
import { Navbar, Nav, NavDropdown, Container } from 'react-bootstrap';
import './Sidenavigationbar.css'; // Assuming you will add custom CSS here

const Sidenavigationbar = () => {
  const user = JSON.parse(localStorage.getItem('user')); // Fetching user data from localStorage
  console.log(user.email);

  return (
    <div className="sidebar">
      <Navbar bg="light" variant="light" expand="lg" className="flex-column">
        <Container fluid>
          <Nav className="flex-column">
            {/* Common Links */}
            <Nav.Link href="/home">Home</Nav.Link>

            {/* Conditionally render based on the user's role */}
            {(user.name === "Riz" || user.name === "Mussa" || user.name === "Karachi") && (
              <>
                <Nav.Link href="/orderList">All Orders</Nav.Link>
              </>
            )}

            {(user.name === "Riz" || user.name === "Mussa" || user.name === "Karachi" || user.name === "Bob") && (
              <>
                <Nav.Link href="/addOrder">Add Order</Nav.Link>
              </>
            )}

            {/* Specific links for user roles */}
            {user.name === "Riz" && (
              <>
                <NavDropdown title="Profiles" id="profiles-dropdown">
                  <NavDropdown.Item href="/riz">Riz</NavDropdown.Item>
                  <NavDropdown.Item href="/bob">Bob Jobs</NavDropdown.Item>
                </NavDropdown>
              </>
            )}

            {user.name === "Mussa" && (
              <>
                <Nav.Link href="/mussa">Mussa</Nav.Link>
              </>
            )}

            {user.name === "Karachi" && (
              <>
                <Nav.Link href="/karachi">Karachi Team</Nav.Link>
              </>
            )}

            {user.name === "Bob" && (
              <>
                <Nav.Link href="/bob">Bob Jobs</Nav.Link>
              </>
            )}

            {/* Common Links */}
            <Nav.Link href="/Packing">Packing List</Nav.Link>
            <Nav.Link href="/instore">In Store</Nav.Link>
            <Nav.Link href="/completed">Completed Orders</Nav.Link>
          </Nav>
        </Container>
      </Navbar>
    </div>
  );
};

export default Sidenavigationbar;
