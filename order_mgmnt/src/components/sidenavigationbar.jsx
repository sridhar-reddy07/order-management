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
            

            {(user.email.toLowerCase() === "riz@tssprinting.com" || 
              user.email.toLowerCase() === "mussa@tssprinting.com" || 
              user.email.toLowerCase() === "karachi@tssprinting.com") && (
              <>
                <Nav.Link href="/home">Home</Nav.Link>
                <Nav.Link href="/orderList">All Orders</Nav.Link>
                <Nav.Link href="/Pullsheet">Pullsheet</Nav.Link>
              </>
            )}

            {(user.email.toLowerCase() === "riz@tssprinting.com" || 
              user.email.toLowerCase() === "mussa@tssprinting.com" || 
              user.email.toLowerCase() === "karachi@tssprinting.com" || 
              user.email.toLowerCase() === "bob@tssprinting.com") && (
              <>
                <Nav.Link href="/addOrder">Add Order</Nav.Link>
              </>
            )}


            {user.email.toLowerCase() === "riz@tssprinting.com" && (
              <>
                <NavDropdown title="Profiles" id="profiles-dropdown">
                  <NavDropdown.Item href="/riz">Riz</NavDropdown.Item>
                  <NavDropdown.Item href="/bob">Bob Jobs</NavDropdown.Item>
                  <NavDropdown.Item href="/mussa">Mussa</NavDropdown.Item>
                  <NavDropdown.Item href="/karachi">Karachi Team</NavDropdown.Item>

                </NavDropdown>
              </>
            )}

            {user.email.toLowerCase() === "mussa@tssprinting.com" && (
              <>
                <Nav.Link href="/mussa">Mussa</Nav.Link>
              </>
            )}

            {user.email.toLowerCase() === "karachi@tssprinting.com" && (
              <>
                <Nav.Link href="/karachi">Karachi Team</Nav.Link>
              </>
            )}

            {user.email.toLowerCase() === "bob@tssprinting.com" && (
              <>
                <Nav.Link href="/bob">Bob Jobs</Nav.Link>
              </>
            )}

            
            <Nav.Link href="/packing">Packing List</Nav.Link>
            <Nav.Link href="/shipped">Shipped Orders</Nav.Link>
            <Nav.Link href="/instore">In Store</Nav.Link>

            <Nav.Link href="/completed">Completed Orders</Nav.Link>
          </Nav>
        </Container>
      </Navbar>
    </div>
  );
};

export default Sidenavigationbar;
