import * as React from "react";
import { Container, Navbar } from "react-bootstrap";
import logo from "./twitter.svg";

const CCNav = () => {
    return <>
    
    <Navbar>
      <Container>
        <Navbar.Brand href="#home">Crypto is Good</Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse className="justify-content-end">
          <Navbar.Text>
            <img src={logo}></img>
          </Navbar.Text>
        </Navbar.Collapse>
      </Container>
    </Navbar>
    
    </>
    
}

export default CCNav