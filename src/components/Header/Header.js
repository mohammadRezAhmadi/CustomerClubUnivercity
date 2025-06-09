import React from 'react'
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';

function Header() {
  return (
    <Navbar collapseOnSelect expand="lg" className="mb-5">
      <Container>
        <img src='./images/meli_mahrat.png' alt='logo' width={100} height={100} />
      </Container>
    </Navbar>
  )
}

export default Header
