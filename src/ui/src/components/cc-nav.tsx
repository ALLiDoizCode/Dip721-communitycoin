import * as React from "react";
import { Col, Container, Nav, Navbar, NavDropdown, Row } from "react-bootstrap";

const CCNav = () => {
    return <>
    <Navbar>
      <Container>
        <Navbar.Brand href="#">
            <img style={{width: "75px"}} src="yc.svg"></img>
        </Navbar.Brand>
        <Navbar.Text>CigDao</Navbar.Text>
        <Navbar.Toggle />
        <Navbar.Collapse className="justify-content-end">
        <Nav className="me-auto">
            <Nav.Link disabled href="https://documenter.getpostman.com/view/1266173/2s8YKAniwU#90c50659-7cf8-4a32-bf05-946">API</Nav.Link>
            <Nav.Link disabled href="#">White Paper</Nav.Link>

        </Nav>
        <Row style={{maxWidth: "200px"}}>
            <Col>
                <a href="https://twitter.com/crypto_is_good">
                    <img className="social-logo" src="twitter.svg"></img>
                </a>
            </Col>
            <Col>
                <a href="https://oc.app/#/zos44-xiaaa-aaaaf-aiica-cai">
                    <img className="social-logo" src="openchat.svg"></img>
                </a>
            </Col>
        </Row>
        </Navbar.Collapse>
      </Container>
    </Navbar>

    <img className="round-border" src="cryptoisgood.png">
    </img>
    </>
    
}

export default CCNav