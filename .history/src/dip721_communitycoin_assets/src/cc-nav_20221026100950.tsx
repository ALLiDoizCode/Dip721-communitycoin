import * as React from "react";
import { Button, Container, Navbar } from "react-bootstrap";
import twitterLogo from "../assets/twitter.svg";
const CCNav = () => {
    return <>
    
    <Navbar>
      <Container>
        <Navbar.Brand href="#home">Crypto is Good</Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse className="justify-content-end">
          <Navbar.Text>
            <image src="twitter.svg"></image>
          </Navbar.Text>
        </Navbar.Collapse>
      </Container>
    </Navbar>
    
    </>
    
}

export default CCNav