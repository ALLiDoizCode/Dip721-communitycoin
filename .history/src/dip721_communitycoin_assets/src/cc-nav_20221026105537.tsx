import * as React from "react";
import { Container, Navbar } from "react-bootstrap";

const CCNav = () => {
    return <>
    
    <Navbar>
      <Container>
        <Navbar.Brand href="#home">Crypto is Good</Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse className="justify-content-end">
          <Navbar.Text>
            <img className="social-logo" src="twitter.svg"></img>
          </Navbar.Text>
        </Navbar.Collapse>
      </Container>
    </Navbar>
    
    </>
    
}

export default CCNav