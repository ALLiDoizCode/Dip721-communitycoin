import * as React from "react";
import { Col, Container, Navbar, Row } from "react-bootstrap";

const CCNav = () => {
    return <>
    <Navbar>
      <Container>
        <Navbar.Brand href="#home">Crypto is Good</Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse className="justify-content-end">
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


    
    </>
    
}

export default CCNav