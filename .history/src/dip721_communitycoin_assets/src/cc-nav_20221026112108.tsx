import * as React from "react";
import { Container, Navbar } from "react-bootstrap";

const CCNav = () => {
    return <>
    
    <Navbar>
      <Container>
        <Navbar.Toggle />
        <Navbar.Collapse className="justify-content-center">
          <Navbar.Text>
            <img className="social-logo" src="twitter.svg"></img>
            <img className="social-logo" src="twitter.svg"></img>
          </Navbar.Text>
        </Navbar.Collapse>
      </Container>
    </Navbar>
    
    </>
    
}

export default CCNav