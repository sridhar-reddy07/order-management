import React from 'react';
import { Navbar, Nav, NavDropdown, Container } from 'react-bootstrap';

const Sidenavigationbar = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  console.log(user.email);
  return (
    <div className="sidebar">
      <Navbar bg="LIGHT" variant="LIGHT" expand="lg" className="flex-column">
        <Container fluid>
          
          <Nav className="flex-column">
            
            {user.email === "admin@gmail.com" ? (<>
              <Nav.Link href="/home">Home</Nav.Link>
              <Nav.Link href="/addOrder">Add Order</Nav.Link>
              <Nav.Link href="/orderList">All Orders</Nav.Link>
            </>):(
              <>
              </>
            )}
            
            {/* <Nav.Link href="/orderList">Reorder List</Nav.Link> */}
            
            <NavDropdown title="Profiles" id="profiles-dropdown">
              <NavDropdown.Item href="/karachi">Karachi Team</NavDropdown.Item>
              <NavDropdown.Item href="/riz">Riz</NavDropdown.Item>
              <NavDropdown.Item href="/mussa">Mussa</NavDropdown.Item>
              <NavDropdown.Item href="/bob">Bob Jobs</NavDropdown.Item>
            </NavDropdown>
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
