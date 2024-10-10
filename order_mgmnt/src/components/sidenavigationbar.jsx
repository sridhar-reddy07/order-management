import React from 'react';
import { Navbar, Nav, NavDropdown, Container } from 'react-bootstrap';


const Sidenavigationbar = () => {
  const user = JSON.parse(localStorage.getItem('user')); // Fetching user data from localStorage
  console.log(user);

  return (
    <div className="sidebar">
      <Navbar bg="light" variant="light" expand="lg" className="flex-column">
        <Container fluid>
          <Nav className="flex-column">
            {/* Common Links */}
            

            {/* Conditionally render based on the user's role */}
            {(user.email === "riz@tssprinting.com" || user.email === "mussa@tssprinting.com" || user.email === "karachi@tssprinting.com") && (

              <>
                <Nav.Link href="/home">Home</Nav.Link>
                <Nav.Link href="/orderList">All Orders</Nav.Link>
                <Nav.Link href="/Pullsheet">Pullsheet</Nav.Link>
              </>
            )}

            {(user.email === "riz@tssprinting.com" || user.email === "mussa@tssprinting.com" || user.email === "karachi@tssprinting.com" || user.email === "bob@tssprinting.con") && (
              <>
                <Nav.Link href="/addOrder">Add Order</Nav.Link>
              </>
            )}

            {/* Specific links for user roles */}
            {user.email === "riz@tssprinting.com" && (
              <>
                <NavDropdown title="Profiles" id="profiles-dropdown">
                  <NavDropdown.Item href="/riz">Riz</NavDropdown.Item>
                  <NavDropdown.Item href="/bob">Bob Jobs</NavDropdown.Item>
                </NavDropdown>
              </>
            )}

            {user.email === "mussa@tssprinting.com" && (
              <>
                <Nav.Link href="/mussa">Mussa</Nav.Link>
              </>
            )}

            {user.email === "karachi@tssprinting.com" && (
              <>
                <Nav.Link href="/karachi">Karachi Team</Nav.Link>
              </>
            )}

            {user.email === "bob@tssprinting.com" && (
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
