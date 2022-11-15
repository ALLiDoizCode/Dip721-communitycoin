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
            <Nav.Link href="https://documenter.getpostman.com/view/1266173/2s8YKAniwU#90c50659-7cf8-4a32-bf05-946">API</Nav.Link>

        </Nav>
        <Row style={{maxWidth: "250px"}}>
            <Col>
                <a href="https://twitter.com/CigDao_">
                    <img className="social-logo" src="twitter.svg"></img>
                </a>
            </Col>
            <Col>
                <a href="https://dscvr.one/p/cigdao">
                    <img className="social-logo" src="dscvr.svg"></img>
                </a>
            </Col>
            <Col>
                <a href="https://aqs24-xaaaa-aaaal-qbbea-cai.ic0.app/groups/214">
                    <img  className="social-logo" src="catalyst.svg"></img>
                </a>
            </Col>
        </Row>
        </Navbar.Collapse>
      </Container>
    </Navbar>

    <img width={"500px"} className="round-border" src="cigdaologo.png">
    </img>
    </>
    
}

export default CCNav