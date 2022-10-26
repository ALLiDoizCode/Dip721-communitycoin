import * as React from "react";
import { Col, Row } from "react-bootstrap";

const CCNav = () => {
    return <>

    <Row style={{maxWidth: 200px}}>
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
    
    </>
    
}

export default CCNav